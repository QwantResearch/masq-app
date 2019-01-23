import signalhub from 'signalhubws'
import swarm from 'webrtc-swarm'
import pump from 'pump'
import uuidv4 from 'uuid/v4'
import common from 'masq-common'

import { isUsernameAlreadyTaken } from './utils'

const { encrypt, decrypt, importKey, exportKey, genAESKey, genEncryptedMasterKey, decryptMasterKey } = common.crypto
const { dbReady, createPromisifiedHyperDB, put, get } = common.utils

const { ERRORS, MasqError, checkObject } = common.errors

const HUB_URLS = process.env.REACT_APP_SIGNALHUB_URLS.split(',')

const swarmOpts = process.env.NODE_ENV === 'test'
  ? { wrtc: require('wrtc') }
  : {}

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
  }

  /**
   * Open and replicate a profile database
   */
  async openProfile (profileId, passphrase) {
    if (!profileId) throw new MasqError(ERRORS.MISSING_PROFILE_ID)

    // close existing profile, if any
    this.closeProfile()

    this.profileId = profileId
    this.profileDB = openOrCreateDB(profileId)

    const protectedMK = await this._getProtectedMK()
    try {
      const MK = await decryptMasterKey(passphrase, protectedMK)
      this.masterKey = await importKey(MK)
    } catch (error) {
      this.closeProfile()
      throw new MasqError(ERRORS.INVALID_PASSPHRASE)
    }

    await dbReady(this.profileDB)
    this._startReplicate(this.profileDB)

    const apps = await this.getApps()
    apps.forEach(app => {
      const dbName = profileId + '-' + app.id
      const db = openOrCreateDB(dbName)
      this.appsDBs[dbName] = db
      db.on('ready', () => this._startReplicate(db))
    })

    const profile = await this.getAndDecrypt('/profile')
    return profile
  }

  async closeProfile () {
    this._stopAllReplicates()
    this.profileDB = null
    this.masterKey = null
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
    if (isUsernameTaken) { throw new MasqError(ERRORS.USERNAME_ALREADY_TAKEN) }

    const id = uuidv4()
    const protectedMK = await genEncryptedMasterKey(profile.password)
    const MK = await decryptMasterKey(profile.password, protectedMK)
    this.masterKey = await importKey(MK)

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
    const db = openOrCreateDB(id)
    await dbReady(db)

    // we do not use this.encryptAndPut because this value is not encrypted
    await db.putAsync('/profile/protectedMK', protectedMK)
    // We do not use this.encryptAndPut method because the master key
    // is not stored in this.profileDB (only set in openProfile)
    await put(db, this.masterKey, '/profile', privateProfile)
    this._setProfileToLocalStorage(publicProfile)
  }

  /**
   * Get a value
   * @param {string} key - Key
   * @returns {Promise<Object>}
   */
  async getAndDecrypt (key) {
    this._checkProfile()
    this._checkMK()
    const dec = await get(this.profileDB, this.masterKey, key)
    return dec
  }

  /**
   * Put a new value in the current profile database
   * The db parameter is only needed when this.profileDB is not set
   * @param {string} key - Key
   * @param {Object} value - The value to insert
   * @returns {Promise}
   */
  async encryptAndPut (key, value) {
    this._checkProfile()
    this._checkMK()
    await put(this.profileDB, this.masterKey, key, value)
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
  async getProfile (profileId) {
    const profile = await this.getAndDecrypt('/profile')
    return profile
  }

  /**
   * Update an existing profile
   * @param {object} profile The updated profile
   */
  async updateProfile (profile) {
    // TODO: Check profile
    this._checkProfile()
    const id = profile.id
    if (!id) throw new MasqError(ERRORS.MISSING_PROFILE_ID)

    const isUsernameTaken = await isUsernameAlreadyTaken(profile.username, id)
    if (isUsernameTaken) { throw new MasqError(ERRORS.USERNAME_ALREADY_TAKEN) }

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
   * Add an app to a specified profile
   * @param {object} app The app
   */
  addApp (app) {
    checkObject(app, requiredParametersApp)
    return this._createResource('apps', app)
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

      const sendAuthorized = async (peer, userAppDbId, userAppDEK) => {
        const data = { msg: 'authorized', userAppDbId, userAppDEK }
        const encryptedMsg = await encrypt(this.key, data, 'base64')
        peer.send(JSON.stringify(encryptedMsg))
      }

      const sendNotAuthorized = async (peer) => {
        const data = { msg: 'notAuthorized' }
        const encryptedMsg = await encrypt(this.key, data, 'base64')
        peer.send(JSON.stringify(encryptedMsg))
      }

      this.hub = signalhub(channel, HUB_URLS)
      this.sw = swarm(this.hub, swarmOpts)

      this.sw.on('disconnect', async () => {
        await this._closeUserAppConnection()
        return reject(new MasqError(ERRORS.DISCONNECTED_DURING_LOGIN))
      })

      this.sw.once('peer', async (peer) => {
        this.peer = peer

        peer.on('error', async (err) => {
          await this._closeUserAppConnection()
          return reject(err)
        })

        const apps = await this.getApps()
        const app = apps.find(app => app.appId === appId)

        try {
          if (app) {
            await sendAuthorized(peer, app.id, app.appDEK)
          } else {
            await sendNotAuthorized(peer)
          }
        } catch (e) {
          await this._closeUserAppConnection()
          return reject(new MasqError(ERRORS.DISCONNECTED_DURING_LOGIN))
        }

        peer.once('data', async (data) => {
          const json = await decrypt(this.key, JSON.parse(data), 'base64')

          if (json.msg === 'connectionEstablished') {
            await this._closeUserAppConnection()
            return resolve(true)
          } else if (json.msg === 'registerUserApp') {
            const { name, description, imageURL } = json
            this.app = { name, description, imageURL }
            resolve(false)
          } else {
            await this._closeUserAppConnection()
            reject(new MasqError(ERRORS.INVALID_DATA))
          }
        })
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
    return new Promise(async (resolve, reject) => {
      this._checkProfile()

      let dbName = ''

      const sendAccessRefused = async (peer) => {
        const data = { msg: 'masqAccessRefused' }
        const encryptedMsg = await encrypt(this.key, data, 'base64')
        peer.send(JSON.stringify(encryptedMsg))
      }

      const sendAccessGranted = async (peer, dbKey, userAppDbId, userAppDEK) => {
        const data = { msg: 'masqAccessGranted', key: dbKey, userAppDbId, userAppDEK }
        const encryptedMsg = await encrypt(this.key, data, 'base64')
        peer.send(JSON.stringify(encryptedMsg))
      }

      const sendWriteAccessGranted = async (peer) => {
        const data = { msg: 'writeAccessGranted' }
        const encryptedMsg = await encrypt(this.key, data, 'base64')
        peer.send(JSON.stringify(encryptedMsg))
      }

      const handleData = async (peer, data) => {
        const json = await decrypt(this.key, JSON.parse(data), 'base64')
        const { msg } = json
        // TODO: Error if  missing params

        if (msg === 'requestWriteAccess') {
          const userAppKey = Buffer.from(json.key, 'hex')
          try {
            await this.appsDBs[dbName].authorizeAsync(userAppKey)
          } catch (err) {
            throw new MasqError(ERRORS.AUTHORIZE_DB_KEY_FAILED)
          }
          await sendWriteAccessGranted(peer)
          this.sw.close()
          return resolve()
        }
      }

      if (!isGranted) {
        await sendAccessRefused(this.peer)
        await this._closeUserAppConnection()
        return resolve()
      }

      const apps = await this.getApps()
      const app = apps.find(app => app.appId === this.appId)
      const appDEK = app ? app.appDEK : await this._genAppDEK()

      const id = app ? app.id : await this.addApp({
        ...this.app, appId: this.appId, appDEK
      })

      dbName = this.profileId + '-' + id
      const db = openOrCreateDB(dbName)
      this.appsDBs[dbName] = db
      db.on('ready', async () => {
        this._startReplicate(db)
        await sendAccessGranted(this.peer, db.key.toString('hex'), id, appDEK)
      })
      this.peer.on('data', (data) => handleData(this.peer, data))
    })
  }

  /**
   * Private methods
   */

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
    const node = await this.getAndDecrypt(`/${name}`)
    const ids = node || []
    const id = uuidv4()
    res['id'] = id

    /* TODO: define a batch method to encrypt and batch in masq-common */
    await this.encryptAndPut(`/${name}`, [...ids, id])
    await this.encryptAndPut(`/${name}/${id}`, res)

    return id
  }

  async _getResources (name) {
    const node = await this.getAndDecrypt(`/${name}`)
    if (!node) return []

    const ids = node

    const resourcePromises = ids.map(async (id) => {
      const val = await this.getAndDecrypt(`/${name}/${id}`)
      return val
    })
    const resources = await Promise.all(resourcePromises)
    return resources
  }

  _updateResource (name, res) {
    const id = res.id
    if (!id) throw new MasqError(ERRORS.MISSING_RESOURCE_ID)
    return this.encryptAndPut(`/${name}/${id}`, res)
  }

  _setProfileToLocalStorage (profile) {
    const id = profile.id
    if (!id) throw new MasqError(ERRORS.MISSING_PROFILE_ID)

    window.localStorage.setItem(id, JSON.stringify({
      id: id,
      username: profile.username,
      image: profile.image
    }))
  }

  _getProfilesFromLocalStorage () {
    const ids = Object.keys(window.localStorage)
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

  _checkProfile () {
    if (!this.profileDB) throw new MasqError(ERRORS.PROFILE_NOT_OPENED)
  }

  _checkMK () {
    if (!this.masterKey) throw Error('MasterKey is not set')
  }

  _closeUserAppConnection () {
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
