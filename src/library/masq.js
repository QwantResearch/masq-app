import signalhub from 'signalhubws'
import swarm from 'webrtc-swarm'
import pump from 'pump'
import uuidv4 from 'uuid/v4'
import * as common from 'masq-common'
import { isUsernameAlreadyTaken } from './utils'

const { CustomEvent, dispatchEvent } = window

const { encrypt, decrypt, importKey, exportKey, genAESKey, genEncryptedMasterKeyAndNonce, decryptMasterKeyAndNonce, genRandomBuffer, updateMasterKeyAndNonce } = common.crypto
const { dbReady, createPromisifiedHyperDB, put, get, list, del } = common.utils

const { MasqError, checkObject } = common.errors

const HUB_URLS = process.env.REACT_APP_SIGNALHUB_URLS.split(',')

const STATE_DEBUG = true

const STATES = {
  CLEAN_NEEDED: 'cleanNeeded',
  NOT_LOGGED: 'notLogged',
  LOGGED: 'logged',
  CHECK_USER_APP: 'needCheckUserApp',
  REGISTER_NEEDED: 'registerNeeded',
  USERAPP_INFO_RECEIVED: 'userAppInfoReceived',
  USER_REFUSED: 'userRefused',
  USER_ACCEPTED: 'userAccepted',
  REQUEST_WRITE_ACCESS_MATERIAL: 'requestWriteAccessMaterial',
  WRITE_ACCESS_PROVIDED: 'writeAccessProvided'

}

let STUN_TURN = []

if (process.env.REACT_APP_REMOTE_WEBRTC === 'true') {
  if (process.env.REACT_APP_STUN_URLS) {
    const urls = process.env.REACT_APP_STUN_URLS.split(',').map(
      u => {
        return { urls: u }
      })
    STUN_TURN = STUN_TURN.concat(urls)
  }

  if (process.env.REACT_APP_TURN_URLS) {
    const urls = process.env.REACT_APP_TURN_URLS.split(',').map(
      u => {
        const splitted = u.split('|')
        return {
          urls: splitted[0],
          username: splitted[1],
          credential: splitted[2]
        }
      })
    STUN_TURN = STUN_TURN.concat(urls)
  }
}

const swarmOpts = { config: { iceServers: STUN_TURN } }

const requiredParametersDevice = [
  'name'
]

const requiredParametersApp = [
  'name',
  'description',
  'appId'
]

const requiredParametersProfile = [
  'username',
  'firstname',
  'lastname',
  'password',
  'image'
]

/**
 * Open or create a hyperdb instance
 * @param {string} name The indexeddb store name
 */
const openOrCreateDB = (name) => {
  return createPromisifiedHyperDB(name)
}

const dispatchMasqError = (errorCode) => {
  const event = new CustomEvent('MasqError', {
    detail: errorCode
  })
  dispatchEvent(event)
}

class Masq {
  constructor () {
    this.profileId = null
    this.profileDB = null

    this.appsDBs = {}
    this.swarms = {}
    this.hubs = {}

    this.sw = null // sw used during login and registration
    this.hub = null
    this.key = null
    this.masterKey = null
    this.peer = null
    this.app = null
    this.dbName = null // used only during userApp registration

    // init state
    this.state = STATES.NOT_LOGGED
  }

  setState (newState) {
    if (STATE_DEBUG) console.log(` ##### From ${this.state} -> ${newState} ######`)
    if (newState === STATES.CLEAN_NEEDED) {
      if (this.state === STATES.USER_ACCEPTED ||
          this.state === STATES.REQUEST_WRITE_ACCESS_MATERIAL) {
        this._removeDb()
      }
      this._clean()
    }
    this.state = newState
  }

  /**
   * Open and replicate a profile database
   */
  async openProfile (profileId, passphrase) {
    if (!profileId) throw new MasqError(MasqError.MISSING_PROFILE_ID)

    // close existing profile, if any
    this.closeProfile()

    this.profileId = profileId
    this.profileDB = openOrCreateDB(`profile-${profileId}`)

    const protectedMK = await this._getProtectedMK()
    try {
      const { masterKey, nonce } = await decryptMasterKeyAndNonce(passphrase, protectedMK)
      this.masterKey = await importKey(masterKey)
      this.nonce = nonce
    } catch (error) {
      this.closeProfile()
      throw new MasqError(MasqError.INVALID_PASSPHRASE)
    }

    await dbReady(this.profileDB)
    this._startReplicate(this.profileDB)

    const apps = await this.getApps()
    apps.forEach(app => {
      const dbName = `app-${profileId}-${app.id}`
      const db = openOrCreateDB(dbName)
      this.appsDBs[dbName] = db
      db.on('ready', () => this._startReplicate(db))
    })

    const profile = await this.getAndDecrypt('/profile')
    this.setState(STATES.LOGGED)
    return profile
  }

  async closeProfile () {
    this._stopAllReplicates()
    this.profileDB = null
    this.masterKey = null
    this.nonce = null
    this.profileId = null
    this.appsDBs = {}
  }

  /**
   * Create a new profile DB
   * @param {object} profile The new profile to add
   */
  async addProfile (profile) {
    checkObject(profile, requiredParametersProfile)

    const isUsernameTaken = await isUsernameAlreadyTaken(profile.username)
    if (isUsernameTaken) { throw new MasqError(MasqError.USERNAME_ALREADY_TAKEN) }

    const id = uuidv4()
    const protectedMK = await genEncryptedMasterKeyAndNonce(profile.password)

    const { masterKey, nonce } = await decryptMasterKeyAndNonce(profile.password, protectedMK)

    const _masterKey = await importKey(masterKey)

    const publicProfile = {
      username: profile.username,
      image: profile.image,
      id: id
    }
    const privateProfile = {
      ...publicProfile,
      firstname: profile.firstname,
      lastname: profile.lastname
    }

    // Create a DB for this profile
    const db = openOrCreateDB(`profile-${id}`)
    await dbReady(db)

    // we do not use this.encryptAndPut because this value is not encrypted
    await db.putAsync('/profile/protectedMK', protectedMK)
    // We do not use this.encryptAndPut method because the master key
    // is not stored in this.profileDB (only set in openProfile)
    await put(db, _masterKey, nonce, '/profile', privateProfile)
    this._setProfileToLocalStorage(publicProfile)
    return privateProfile
  }

  async removeProfile () {
    // Remove every apps data
    const apps = await this.getApps()
    for (let app of apps) {
      await this.removeApp(app)
    }

    // Remove the profile
    const dbName = `profile-${this.profileId}`
    await this.closeProfile()
    window.indexedDB.deleteDatabase(dbName)
    window.localStorage.removeItem(dbName)
  }

  /**
   * Get a value
   * @param {string} key - Key
   * @returns {Promise<Object>}
   */
  async getAndDecrypt (key) {
    this._checkProfile()
    const dec = await get(this.profileDB, this.masterKey, this.nonce, key)
    return dec
  }

  /**
   * Put a new value in the current profile database
   * @param {string} key - Key
   * @param {Object} value - The value to insert
   * @returns {Promise}
   */
  async encryptAndPut (key, value) {
    this._checkProfile()
    await put(this.profileDB, this.masterKey, this.nonce, key, value)
  }

  /**
   * Delete a a key in the current profile database
   * @param {string} key - Key
   * @returns {Promise}
   */
  async del (key) {
    this._checkProfile()
    await del(this.profileDB, this.masterKey, this.nonce, key)
  }

  /**
   * List items
   * @param {string} key - Key
   * @returns {Promise<Object>}
   */
  async listAndDecrypt (key) {
    this._checkProfile()
    const items = await list(this.profileDB, this.masterKey, this.nonce, key)
    return items
  }

  /**
   * Get public profiles from localstorage (id, username, and )
   */
  async getProfiles () {
    return this._getProfilesFromLocalStorage()
  }

  /**
   * Get private profile from hyperdb
   */
  async getProfile () {
    const profile = await this.getAndDecrypt('/profile')
    return profile
  }

  /**
   * Update an existing profile
   * @param {object} profile The updated profile
   */
  async updateProfile (profile) {
    this._checkProfile()
    const id = profile.id
    if (!id) throw new MasqError(MasqError.MISSING_PROFILE_ID)

    const isUsernameTaken = await isUsernameAlreadyTaken(profile.username, id)
    if (isUsernameTaken) {
      throw new MasqError(MasqError.USERNAME_ALREADY_TAKEN)
    }

    const privateProfile = await this.getProfile(id)
    // First update private profile
    const updatedPrivateProfile = { ...privateProfile, ...profile }
    // Extract public profile from up-to-date profile
    const updatePublicProfile = {
      username: updatedPrivateProfile.username,
      image: updatedPrivateProfile.image,
      id: id
    }

    await this.encryptAndPut('/profile', updatedPrivateProfile)
    this._setProfileToLocalStorage(updatePublicProfile)
  }

  /**
   * Update passphrase
   * @param {string} currentPassPhrase The current passphrase
   * @param {string} newPassPhrase The new passphrase
   */
  async updatePassphrase (currentPassPhrase, newPassPhrase) {
    this._checkProfile()
    const protectedMK = await this._getProtectedMK()
    try {
      const protectedMKNewPass = await updateMasterKeyAndNonce(currentPassPhrase, newPassPhrase, protectedMK)
      // we do not use this.encryptAndPut because this value is not encrypted
      await this.profileDB.putAsync('/profile/protectedMK', protectedMKNewPass)
    } catch (error) {
      throw new MasqError(MasqError.INVALID_PASSPHRASE)
    }
  }

  /**
   * Add an app to a specified profile
   * @param {object} app The app
   */
  addApp (app) {
    checkObject(app, requiredParametersApp)
    return this._createResource('apps', app)
  }

  /**
   * Remove an app to a specified profile
   * @param {object} app The app
   */
  removeApp (app) {
    checkObject(app, requiredParametersApp)
    const dbName = `app-${this.profileId}-${app.id}`
    const discoveryKey = this.appsDBs[dbName].discoveryKey.toString('hex')
    const sw = this.swarms[discoveryKey]
    sw.close()
    window.indexedDB.deleteDatabase(dbName)
    return this._deleteResource('apps', app)
  }

  /**
   * Add a device to a specified profile
   * @param {object} device The device
   */
  addDevice (device) {
    checkObject(device, requiredParametersDevice)
    return this._createResource('devices', device)
  }

  /**
   * Get all apps of the current profile
   */
  getApps () {
    this._checkProfile()
    return this._getResources('apps')
  }

  /**
   * Get all devices of the current profile
   */
  getDevices () {
    this._checkProfile()
    return this._getResources('devices')
  }

  /**
   * Update an app
   * @param {object} app The updated app
   */
  async updateApp (app) {
    this._checkProfile()
    await this._updateResource('apps', app)
  }

  /**
   * Update a device
   * @param {object} device The updated device
   */
  async updateDevice (device) {
    this._checkProfile()
    await this._updateResource('devices', device)
  }

  /**
   * Connect to a user-app channel and answer if
   * the user-app is authorized or not.
   * This method should be called only once the user is logged in
   * @param {string} channel The channel to connect
   * @param {string} rawKey The encryption key, base64 encoded
   * @param {string} appId The app id (url for instance)
   */
  async handleUserAppLogin (channel, rawKey, appId) {
    return new Promise(async (resolve, reject) => {
      this.appId = appId
      this._checkProfile()
      this.key = await importKey(Buffer.from(rawKey, 'base64'))

      this.hub = signalhub(channel, HUB_URLS)
      this.hub.on('error', async () => {
        await this._closeUserAppConnection()
        return reject(new MasqError(MasqError.SIGNALLING_SERVER_ERROR))
      })

      this.sw = swarm(this.hub, swarmOpts)

      this.onDisconnect = async () => {
        this.setState(STATES.CLEAN_NEEDED)
        await this._closeUserAppConnection()
        return reject(new MasqError(MasqError.DISCONNECTED_DURING_LOGIN))
      }

      this.sw.on('disconnect', this.onDisconnect)

      this.sw.once('peer', async (peer) => {
        this.peer = peer
        this.setState(STATES.CHECK_USER_APP)
        peer.on('error', async (err) => {
          await this._closeUserAppConnection()
          return reject(err)
        })

        const apps = await this.getApps()
        const app = apps.find(app => app.appId === appId)

        try {
          if (app) {
            const privateProfile = await this.getProfile(this.profileId)
            await this.sendAuthorized(peer, app.id, app.appDEK, privateProfile.username, privateProfile.image, app.appNonce)
            const res = await this.receiveEndOfConnection(peer)
            resolve(res)
          } else {
            await this.sendNotAuthorized(peer)
            const res = await this.receiveRegisterRequest(peer)
            resolve(res)
          }
        } catch (e) {
          // FIX ME
          // On chrome Headless we receive this error
          // This error message comes from the browser,
          // we need to check if this is the same message for Firefox/safari...
          // This fix is needed in order to detect other errors than the peer.send error
          // message for chrome headless : e.message === "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'"
          await this._closeUserAppConnection()
          return reject(new MasqError(MasqError.DISCONNECTED_DURING_LOGIN))
        }
      })
    })
  }

  async sendAuthorized (peer, userAppDbId, userAppDEK, username, profileImage, userAppNonce) {
    this.setState(STATES.LOGGED)
    const data = { msg: 'authorized', userAppDbId, userAppDEK, username, profileImage, userAppNonce }
    const encryptedMsg = await encrypt(this.key, data, 'base64')
    peer.send(JSON.stringify(encryptedMsg))
  }

  async receiveEndOfConnection (peer) {
    return new Promise(async (resolve, reject) => {
      peer.once('data', async (data) => {
        const json = await decrypt(this.key, JSON.parse(data), 'base64')
        if (json.msg === 'connectionEstablished') {
          await this._closeUserAppConnection()
          resolve({ isConnected: true })
        } else {
          await this._closeUserAppConnection()
          reject(new MasqError(MasqError.WRONG_MESSAGE, `Unexpectedly received message with type ${json.msg}`))
        }
      })
    })
  }

  async sendNotAuthorized (peer) {
    this.setState(STATES.REGISTER_NEEDED)
    const data = { msg: 'notAuthorized' }
    const encryptedMsg = await encrypt(this.key, data, 'base64')
    peer.send(JSON.stringify(encryptedMsg))
  }

  async receiveRegisterRequest (peer) {
    return new Promise(async (resolve, reject) => {
      peer.once('data', async (data) => {
        const json = await decrypt(this.key, JSON.parse(data), 'base64')

        if (json.msg === 'registerUserApp') {
          const { name, description, imageURL } = json
          this.app = { name, description, imageURL }
          this.setState(STATES.USERAPP_INFO_RECEIVED)
          resolve({ isConnected: false, ...this.app })
        } else {
          await this._closeUserAppConnection()
          reject(new MasqError(MasqError.WRONG_MESSAGE, `Unexpectedly received message with type ${json.msg}`))
        }
      })
    })
  }

  /**
   * Exchange messages with a user-app to register it.
   * It will create a new hyperdb with a given id.
   * Then, the user-app send its local key to authorize.
   * This method should be called only once the user is logged in
   * @param {boolean} isGranted True if the app is authorized
   */
  async handleUserAppRegister (isGranted) {
    this._checkProfile()

    if (!isGranted) {
      await this.sendAccessRefused(this.peer)
      await this._closeUserAppConnection()
    }

    await this.sendAccessGranted(this.peer)
  }

  async sendAccessRefused (peer) {
    this.setState(STATES.USER_REFUSED)
    const data = { msg: 'masqAccessRefused' }
    const encryptedMsg = await encrypt(this.key, data, 'base64')
    peer.send(JSON.stringify(encryptedMsg))
  }

  async sendAccessGranted (peer) {
    this.setState(STATES.USER_ACCEPTED)
    const apps = await this.getApps()
    const app = apps.find(app => app.appId === this.appId)
    const appDEK = app ? app.appDEK : await this._genAppDEK()
    const appNonce = app ? app.appNonce : await this._genNonce()

    const id = app ? app.id : await this.addApp({
      ...this.app, appId: this.appId, appDEK, appNonce
    })

    const privateProfile = await this.getProfile()

    const dbName = `app-${this.profileId}-${id}`
    const db = await this._createDBAndSyncApp(dbName)
    // this.dbName must be filled only during the userApp register protocol
    this.dbName = dbName

    const dbKey = db.key.toString('hex')
    const userAppDbId = id
    const userAppDEK = appDEK
    const username = privateProfile.username
    const profileImage = privateProfile.image
    const userAppNonce = appNonce

    const data = { msg: 'masqAccessGranted', key: dbKey, userAppDbId, userAppDEK, username, profileImage, userAppNonce }
    const encryptedMsg = await encrypt(this.key, data, 'base64')
    peer.send(JSON.stringify(encryptedMsg))
    peer.once('data', async (data) => {
      const json = await decrypt(this.key, JSON.parse(data), 'base64')

      switch (json.msg) {
        case 'requestWriteAccess':
          this.setState(STATES.REQUEST_WRITE_ACCESS_MATERIAL)
          await this._grantWriteAccess(this.peer, json, dbName)
          break

        default:
          await this._closeUserAppConnection()
          return new MasqError(MasqError.WRONG_MESSAGE, `Unexpectedly received message with type ${json.msg}`)
      }
    })
  }

  async _grantWriteAccess (peer, json, dbName) {
    const userAppKey = Buffer.from(json.key, 'hex')
    try {
      await this.appsDBs[dbName].authorizeAsync(userAppKey)
    } catch (err) {
      throw new MasqError(MasqError.AUTHORIZE_DB_KEY_FAILED)
    }
    this.setState(STATES.WRITE_ACCESS_PROVIDED)
    const data = { msg: 'writeAccessGranted' }
    const encryptedMsg = await encrypt(this.key, data, 'base64')
    peer.send(JSON.stringify(encryptedMsg))
    await this._closeUserAppConnection()
  }

  _createDBAndSyncApp (dbName) {
    return new Promise((resolve, reject) => {
      const db = openOrCreateDB(dbName)
      this.appsDBs[dbName] = db
      db.on('ready', async () => {
        this._startReplicate(db)
        resolve(db)
      })
    })
  }

  /**
   * Private methods
   */

  _removeDb () {
    if (this.dbName) {
      if (STATE_DEBUG) console.log(`### Clean operation : The userApp db ${this.dbName} exists, we delete it.`)
      this._stopReplicate(this.dbName)
      window.indexedDB.deleteDatabase(this.dbName)
    }
  }

  _clean () {
    if (STATE_DEBUG) console.log(`### Clean operation : we delete the variables`)
    this.hub = null
    this.dbName = null
    this.peer = null
    this.app = null
  }

  /**
   * Generate a User app Data Encryption Key, during the register
   * of a new app, this info is added alongside this the appId (user
   * app database id) during the masqAccessGranted message and authorized
   * message
   * @returns {String} -The secret key in hex format
   */
  async _genAppDEK () {
    const key = await genAESKey(true, 'AES-GCM', 128)
    const extractedKey = await exportKey(key)
    const hexKey = Buffer.from(extractedKey).toString('hex')
    return hexKey
  }

  /**
   * Generate a User app nonce, during the register
   * of a new app, this info is added alongside the appId (user
   * app database id) during the masqAccessGranted message and authorized
   * message.
   * The nonce is used to hash the keys of the user-app database
   * @returns {String} -The nonce key in hex format
   */
  async _genNonce () {
    return genRandomBuffer(16, 'hex')
  }

  async _decryptValue (ciphertext) {
    let decryptedMsg = await decrypt(this.masterKey, ciphertext)
    return decryptedMsg
  }

  async _encryptValue (plaintext) {
    let encryptedMsg = await encrypt(this.masterKey, plaintext)
    return encryptedMsg
  }

  async _getProtectedMK () {
    this._checkProfile()
    const protectedMK = await this.profileDB.getAsync('/profile/protectedMK')
    return protectedMK.value
  }

  async _createResource (name, res) {
    const id = uuidv4()
    res['id'] = id
    await this.encryptAndPut(`/${name}/${id}`, res)

    return id
  }

  async _getResources (name) {
    const node = await this.listAndDecrypt(`/${name}`)
    return Object.keys(node).length === 0 ? [] : Object.values(node)
  }

  _updateResource (name, res) {
    const id = res.id
    if (!id) throw new MasqError(MasqError.MISSING_RESOURCE_ID)
    return this.encryptAndPut(`/${name}/${id}`, res)
  }

  _deleteResource (name, res) {
    const id = res.id
    if (!id) throw new MasqError(MasqError.MISSING_RESOURCE_ID)
    return this.del(`/${name}/${id}`)
  }

  _setProfileToLocalStorage (profile) {
    const id = profile.id
    if (!id) throw new MasqError(MasqError.MISSING_PROFILE_ID)

    window.localStorage.setItem(`profile-${id}`, JSON.stringify({
      id: id,
      username: profile.username,
      image: profile.image
    }))
  }

  _getProfilesFromLocalStorage () {
    const ids = Object
      .keys(window.localStorage)
      .filter(k => k.split('-')[0] === 'profile')

    if (!ids) return []

    const profiles = ids.map(id =>
      JSON.parse(window.localStorage.getItem(id))
    )

    return profiles
  }

  /**
   * Replicate a database in a swarm using
   * db.discoveryKey as channel name
   */
  _startReplicate (db) {
    const discoveryKey = db.discoveryKey.toString('hex')
    this.hubs[discoveryKey] = signalhub(discoveryKey, HUB_URLS)
    this.hubs[discoveryKey].on('error', () => {
      dispatchMasqError(MasqError.REPLICATION_SIGNALLING_ERROR)
    })

    this.swarms[discoveryKey] = swarm(this.hubs[discoveryKey], swarmOpts)
    this.swarms[discoveryKey].on('peer', peer => {
      const stream = db.replicate({ live: true })
      pump(peer, stream, peer)
    })
  }

  _stopAllReplicates () {
    Object.values(this.swarms).forEach(sw => sw.close())
    this.swarms = {}
    this.hubs = {}
  }

  _stopReplicate (dbName) {
    const discoveryKey = this.appsDBs[dbName].discoveryKey.toString('hex')
    this.appsDBs[dbName] = null
    this.hubs[discoveryKey] = null
    this.swarms[discoveryKey].close()
    this.swarms[discoveryKey] = null
  }

  _checkProfile () {
    if (!this.profileDB) throw new MasqError(MasqError.PROFILE_NOT_OPENED)
  }

  _closeUserAppConnection () {
    this.sw.removeListener('disconnect', this.onDisconnect)
    return new Promise((resolve, reject) => {
      this.sw.on('close', () => {
        this.hub = null
        this.peer = null
        this.app = null
        // FIXME: do not clear this.key , as messages could
        // could still be sending while the connection is closing
        return resolve()
      })
      this.sw.close()
    })
  }
}

export default Masq
