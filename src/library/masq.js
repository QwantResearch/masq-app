import rai from 'random-access-idb'
import signalhub from 'signalhubws'
import hyperdb from 'hyperdb'
import swarm from 'webrtc-swarm'
import pump from 'pump'
import uuidv4 from 'uuid/v4'

import promiseHyperdb from './promiseHyperdb'

const HUB_URLS = ['localhost:8080']

/**
 * Open or create a hyperdb instance
 * @param {string} name The indexeddb store name
 */
const openOrCreateDB = (name) => {
  return hyperdb(rai(name), {
    valueEncoding: 'json',
    firstNode: true
  })
}

/**
 * Replicate a database in a swarm indefinitely,
 * using db.discoveryKey as channel name
 * @param {object} db
 */
const replicateDB = db => {
  const discoveryKey = db.discoveryKey.toString('hex')
  const hub = signalhub(discoveryKey, HUB_URLS)
  const sw = swarm(hub)

  sw.on('peer', peer => {
    const stream = db.replicate({ live: true })
    pump(peer, stream, peer)
  })
}

const dbReady = db =>
  new Promise(resolve =>
    db.on('ready', () => resolve())
  )

class Masq {
  constructor () {
    this.dbs = {
      core: null,
      profiles: null
    }
  }

  /**
   * Initialize Masq: Open core and profiles databases
   * and replicate them in their respective swarms.
   */
  async init () {
    // create or open core and profiles databases
    this.dbs.core = openOrCreateDB('masq-core')
    this.dbs.profiles = openOrCreateDB('masq-profiles')

    Object.values(this.dbs).forEach(db =>
      db.on('ready', () => replicateDB(db))
    )

    const profiles = await this.getProfiles()
    const profilesIds = profiles.map(p => p.id)
    profilesIds.forEach(async (id) => {
      const apps = await this.getApps(id)
      apps.forEach(app => {
        const dbName = id + '-' + app.name
        const db = openOrCreateDB(dbName)
        this.dbs[dbName] = db
        db.on('ready', () => replicateDB(db))
      })
    })
  }

  /**
   * Add a new profile to the core and profiles databases
   * @param {object} profile The new profile to add
   */
  async addProfile (profile) {
    const node = await promiseHyperdb.get(this.dbs.core, '/profiles')
    const ids = node ? node.value : []
    const id = uuidv4()
    profile['id'] = id
    const batch = [{
      type: 'put',
      key: '/profiles',
      value: [...ids, id]
    }, {
      type: 'put',
      key: `/profiles/${id}`,
      value: profile
    }]

    await promiseHyperdb.batch(this.dbs.core, batch)
    await promiseHyperdb.batch(this.dbs.profiles, batch)
  }

  /**
   * Get private profiles from core db
   */
  async getProfiles () {
    const node = await promiseHyperdb.get(this.dbs.core, '/profiles')
    if (!node) return []

    const ids = node.value
    const profilePromises = ids.map(
      id => promiseHyperdb.get(this.dbs.core, `/profiles/${id}`)
    )
    const profileNodes = await Promise.all(profilePromises)
    const profiles = profileNodes.map(n => n.value)
    return profiles
  }

  /**
   * Update an existing profile
   * @param {object} profile The updated profile
   */
  async updateProfile (profile) {
    const id = profile.id
    if (!id) throw Error('Missing id')

    await promiseHyperdb.put(this.dbs.core, `/profile/${id}`, profile)
    await promiseHyperdb.put(this.dbs.profiles, `/profiles/${id}`, profile)
  }

  /**
   * Add an app to a specified profile
   * @param {number} profileId The profile id the app belongs to
   * @param {object} app The app
   */
  addApp (profileId, app) {
    return this._createResource(profileId, 'apps', app)
  }

  /**
   * Add a device to a specified profile
   * @param {number} profileId The profile id the app belongs to
   * @param {object} device The device
   */
  addDevice (profileId, device) {
    return this._createResource(profileId, 'devices', device)
  }

  /**
   * Get all apps attached to a profile id
   * @param {number} profileId The profile id for which we get the apps
   */
  getApps (profileId) {
    return this._getResources(profileId, 'apps')
  }

  /**
   * Get all devices attached to a profile id
   * @param {number} profileId The profile id for which we get the devices
   */
  getDevices (profileId) {
    return this._getResources(profileId, 'devices')
  }

  /**
   * Update an app
   * @param {number} profileId The profile id to which the app is attached
   * @param {object} app The updated app
   */
  updateApp (profileId, app) {
    return this._updateResource(profileId, 'apps', app)
  }

  /**
   * Update a device
   * @param {number} profileId The profile id to which the device is attached
   * @param {object} device The updated device
   */
  async updateDevice (profileId, device) {
    this._updateResource(profileId, 'devices', device)
  }

  async syncProfiles (channel, challenge) {
    await dbReady(this.dbs.profiles)
    const hub = signalhub(channel, HUB_URLS)
    const sw = swarm(hub)

    sw.on('close', () => hub.close())

    sw.on('peer', (peer) => {
      peer.on('data', data => {
        sw.close()
      })

      peer.send(JSON.stringify({
        msg: 'sendProfilesKey',
        challenge: challenge,
        key: this.dbs.profiles.key.toString('hex')
      }))
    })
  }

  createApp (channel, challenge, appName, profileId) {
    return new Promise(async (resolve, reject) => {
      const dbName = profileId + '-' + appName
      const apps = await this.getApps(profileId)
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
            await this.addApp(profileId, {
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
        this.dbs[dbName] = db

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

  async _createResource (profileId, name, res) {
    if (!profileId) throw Error('missing profileId')

    const node = await promiseHyperdb.get(this.dbs.core, `/profiles/${profileId}/${name}`)
    const ids = node ? node.value : []
    const id = uuidv4()
    res['id'] = id

    const batch = [{
      type: 'put',
      key: `/profiles/${profileId}/${name}`,
      value: [...ids, id]
    }, {
      type: 'put',
      key: `/profiles/${profileId}/${name}/${id}`,
      value: res
    }]

    await promiseHyperdb.batch(this.dbs.core, batch)
  }

  async _getResources (profileId, name) {
    if (!profileId) throw Error('missing profileId')

    const node = await promiseHyperdb.get(this.dbs.core, `/profiles/${profileId}/${name}`)
    if (!node) return []

    const ids = node.value
    const resourcePromises = ids.map(
      id => promiseHyperdb.get(this.dbs.core, `/profiles/${profileId}/${name}/${id}`)
    )
    const resourceNodes = await Promise.all(resourcePromises)
    const resources = resourceNodes.map(n => n.value)
    return resources
  }

  async _updateResource (profileId, name, res) {
    if (!profileId) throw Error('missing profileId')

    const id = res.id
    if (!id) throw Error('Missing id')

    return promiseHyperdb.put(this.dbs.core, `/profiles/${profileId}/${name}/${id}`, res)
  }
}

export default Masq
