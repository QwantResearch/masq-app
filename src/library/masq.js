import rai from 'random-access-idb'
import signalhub from 'signalhubws'
import hyperdb from 'hyperdb'
import swarm from 'webrtc-swarm'
import pump from 'pump'
import uuidv4 from 'uuid/v4'
import { promisifyAll } from 'bluebird'

const HUB_URLS = process.env.REACT_APP_SIGNALHUB_URLS.split(',')

/**
 * Open or create a hyperdb instance
 * @param {string} name The indexeddb store name
 */
const openOrCreateDB = (name) => {
  return promisifyAll(hyperdb(rai(name), {
    valueEncoding: 'json',
    firstNode: true
  }))
}

const dbReady = db =>
  new Promise(resolve =>
    db.on('ready', () => resolve())
  )

class Masq {
  constructor () {
    this.profileId = null
    this.profileDB = null

    this.appsDBs = {}
    this.swarms = {}
    this.hubs = {}
  }

  /**
   * Open and replicate a profile database
   */
  async openProfile (profileId) {
    if (!profileId) throw Error('Missing profileId')

    this.closeProfile()

    this.profileId = profileId
    this.profileDB = openOrCreateDB(profileId)
    this.profileDB.on('ready', () => this._startReplicate(this.profileDB))

    const apps = await this.getApps()
    apps.forEach(app => {
      const dbName = profileId + '-' + app.name
      const db = openOrCreateDB(dbName)
      this.appsDBs[dbName] = db
      db.on('ready', () => this._startReplicate(db))
    })

    const profile = (await this.profileDB.getAsync('/')).value
    return profile
  }

  async closeProfile () {
    this._stopAllReplicates()
    this.profileDB = null
    this.profileId = null
    this.dbs = {}
  }

  /**
   * Create a new profile DB
   * @param {object} profile The new profile to add
   */
  async addProfile (profile) {
    // TODO: Check profile properties
    const id = uuidv4()
    profile.id = id

    // Create a DB for this profile
    const db = openOrCreateDB(id)
    await dbReady(db)
    await db.putAsync('/', profile)

    this._setProfileToLocalStorage(profile)
  }

  /**
   * Get public profiles from localstorage (id, username, and )
   */
  async getProfiles () {
    return this._getProfilesFromLocalStorage()
  }

  /**
   * Update an existing profile
   * @param {object} profile The updated profile
   */
  async updateProfile (profile) {
    // TODO: Check profile
    this._checkProfile()
    const id = profile.id
    if (!id) throw Error('Missing id')
    await this.profileDB.putAsync('/', profile)
    this._setProfileToLocalStorage(profile)
  }

  /**
   * Add an app to a specified profile
   * @param {object} app The app
   */
  addApp (app) {
    return this._createResource('apps', app)
  }

  /**
   * Add a device to a specified profile
   * @param {object} device The device
   */
  addDevice (device) {
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
  updateApp (app) {
    this._checkProfile()
    return this._updateResource('apps', app)
  }

  /**
   * Update a device
   * @param {object} device The updated device
   */
  async updateDevice (device) {
    this._updateResource('devices', device)
  }

  createApp (channel, challenge, appName, profileId) {
    return new Promise(async (resolve, reject) => {
      const dbName = profileId + '-' + appName
      const apps = await this.getApps()
      if (apps.find(app => app.name === app)) {
        return resolve()
      }

      const hub = signalhub(channel, HUB_URLS)
      const sw = swarm(hub)

      sw.on('close', () => hub.close())

      sw.on('peer', async (peer) => {
        let db = null

        peer.on('data', async (data) => {
          const json = JSON.parse(data)
          if (json.msg === 'appInfo') {
            await this.addApp({
              name: json.name,
              description: json.description,
              image: json.image
            })
          }

          if (json.msg === 'requestWriteAccess') {
            // authorize local key & start replication
            db.authorize(Buffer.from(json.key, 'hex'), (err) => {
              if (err) throw err
              peer.send(JSON.stringify({ msg: 'ready' }))
              sw.close()
              resolve()
            })
          }
        })

        db = openOrCreateDB(dbName)
        this.appsDBs[dbName] = db

        db.on('ready', () => {
          peer.send(JSON.stringify({
            msg: 'sendDataKey',
            challenge: challenge,
            key: db.key.toString('hex')
          }))
        })
      })
    })
  }

  /**
   * Private methods
   */

  async _createResource (name, res) {
    this._checkProfile()
    const node = await this.profileDB.getAsync(`/${name}`)
    const ids = node ? node.value : []
    const id = uuidv4()
    res['id'] = id

    const batch = [{
      type: 'put',
      key: `/${name}`,
      value: [...ids, id]
    }, {
      type: 'put',
      key: `/${name}/${id}`,
      value: res
    }]

    await this.profileDB.batchAsync(batch)
  }

  async _getResources (name) {
    const node = await this.profileDB.getAsync(`/${name}`)
    if (!node) return []

    const ids = node.value
    const resourcePromises = ids.map(
      id => this.profileDB.getAsync(`/${name}/${id}`)
    )
    const resourceNodes = await Promise.all(resourcePromises)
    const resources = resourceNodes.map(n => n.value)
    return resources
  }

  async _updateResource (name, res) {
    const id = res.id
    if (!id) throw Error('Missing id')
    return this.profileDB.putAsync(`/${name}/${id}`, res)
  }

  _setProfileToLocalStorage (profile) {
    const id = profile.id
    if (!id) throw Error('missing id')

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
    this.swarms[discoveryKey] = swarm(this.hubs[discoveryKey])
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
    if (!this.profileDB) throw Error('Open a profile first')
  }
}

export default Masq
