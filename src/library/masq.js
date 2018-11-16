import rai from 'random-access-idb'
import signalhub from 'signalhubws'
import hyperdb from 'hyperdb'
import swarm from 'webrtc-swarm'
import pump from 'pump'
import uuidv4 from 'uuid/v4'

import hyperdbUtils from './hyperdbUtils'

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
  init () {
    return new Promise((resolve, reject) => {
      let readyCount = 0

      // create or open core and profiles databases
      this.dbs.core = openOrCreateDB('masq-core')
      this.dbs.profiles = openOrCreateDB('masq-profiles')

      // Sync
      Object.values(this.dbs).forEach(db => {
        db.on('ready', () => {
          replicateDB(db)
          if (++readyCount === 2) return resolve()
        })
      })
    })
  }

  /**
   * Add a new profile to the core and profiles databases
   * @param {object} profile The new profile to add
   */
  async addProfile (profile) {
    const node = await hyperdbUtils.promiseGet(this.dbs.core, '/profiles')
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

    await hyperdbUtils.promiseBatch(this.dbs.core, batch)
    await hyperdbUtils.promiseBatch(this.dbs.profiles, batch)
  }

  /**
   * Get private profiles from core db
   */
  async getProfiles () {
    const node = await hyperdbUtils.promiseGet(this.dbs.core, '/profiles')
    if (!node) return []

    const ids = node.value
    const profilePromises = ids.map(
      id => hyperdbUtils.promiseGet(this.dbs.core, `/profiles/${id}`)
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

    await hyperdbUtils.promisePut(this.dbs.core, `/profile/${id}`, profile)
    await hyperdbUtils.promisePut(this.dbs.profiles, `/profiles/${id}`, profile)
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
   * Add an app to a specified profile
   * @param {number} profileId The profile id the app belongs to
   * @param {object} device The app
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
  updateDevice (profileId, device) {
    this._updateResource(profileId, 'devices', device)
  }

  syncProfiles (channel, challenge) {
    const hub = signalhub(channel, HUB_URLS)
    const sw = swarm(hub)

    sw.on('close', () => {
      hub.close()
      sw.close()
    })

    sw.on('peer', (peer) => {
      peer.on('data', data => {
        console.log('data', data)
        sw.close()
      })

      peer.send(JSON.stringify({
        msg: 'sendProfilesKey',
        challenge: challenge,
        key: this.dbs.profiles.key.toString('hex')
      }))
    })
  }

  /**
   * Private methods
   */

  async _createResource (profileId, name, res) {
    if (!profileId) throw Error('missing profileId')

    const node = await hyperdbUtils.promiseGet(this.dbs.core, `/profiles/${profileId}/${name}`)
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

    await hyperdbUtils.promiseBatch(this.dbs.core, batch)
  }

  async _getResources (profileId, name) {
    if (!profileId) throw Error('missing profileId')

    const node = await hyperdbUtils.promiseGet(this.dbs.core, `/profiles/${profileId}/${name}`)
    if (!node) return []

    const ids = node.value
    const resourcePromises = ids.map(
      id => hyperdbUtils.promiseGet(this.dbs.core, `/profiles/${profileId}/${name}/${id}`)
    )
    const resourceNodes = await Promise.all(resourcePromises)
    const resources = resourceNodes.map(n => n.value)
    return resources
  }

  async _updateResource (profileId, name, res) {
    if (!profileId) throw Error('missing profileId')

    const id = res.id
    if (!id) throw Error('Missing id')

    return hyperdbUtils.promisePut(this.dbs.core, `/profiles/${profileId}/${name}/${id}`, res)
  }
}

export default Masq
