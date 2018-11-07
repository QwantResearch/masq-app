import rai from 'random-access-idb'
import signalhub from 'signalhubws'
import hyperdb from 'hyperdb'
import swarm from 'webrtc-swarm'
import pump from 'pump'
import uuidv4 from 'uuid/v4'

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
  addProfile (profile) {
    return new Promise((resolve, reject) => {
      this.dbs.core.get('/profiles', (err, node) => {
        if (err) return reject(err)

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

        this.dbs.core.batch(batch, (err) => {
          if (err) return reject(err)
          resolve()
        })
      })
    })
  }

  /**
   * Get private profiles from core db
   */
  getProfiles () {
    return new Promise((resolve, reject) => {
      this.dbs.core.get('/profiles', (err, node) => {
        if (err) return reject(err)
        if (!node) return resolve([])

        const ids = node.value
        const profiles = []

        for (let id of ids) {
          this.dbs.core.get(`/profiles/${id}`, (err, node) => {
            profiles.push(node.value)
            if (err) return reject(err)
            if (ids.length === profiles.length) return resolve(profiles)
          })
        }
      })
    })
  }

  /**
   * Update an existing profile
   * @param {object} profile The updated profile
   */
  updateProfile (profile) {
    const id = profile.id
    if (!id) throw Error('Missing id')

    return new Promise((resolve, reject) => {
      this.dbs.core.put(`/profiles/${id}`, profile, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }

  /**
   * Add an app to a specified profile
   * @param {number} profileId The profile id the app belongs to
   * @param {object} app The app
   */
  addApp (profileId, app) {
    return new Promise((resolve, reject) => {
      this.dbs.core.get(`/profiles/${profileId}/apps`, (err, node) => {
        if (err) return reject(err)

        const ids = node ? node.value : []
        const id = uuidv4()
        app['id'] = id

        const batch = [{
          type: 'put',
          key: `/profiles/${profileId}/apps`,
          value: [...ids, id]
        }, {
          type: 'put',
          key: `/profiles/${profileId}/apps/${id}`,
          value: app
        }]

        this.dbs.core.batch(batch, (err) => {
          if (err) return reject(err)
          resolve()
        })
      })
    })
  }

  /**
   * Get alls apps attached to a profile id
   * @param {number} profileId The profile id for which we get the apps
   */
  getApps (profileId) {
    return new Promise((resolve, reject) => {
      this.dbs.core.get(`/profiles/${profileId}/apps`, (err, node) => {
        if (err) return reject(err)
        if (!node) return resolve([])

        const ids = node.value
        const apps = []

        for (let id of ids) {
          this.dbs.core.get(`/profiles/${profileId}/apps/${id}`, (err, node) => {
            apps.push(node.value)
            if (err) return reject(err)
            if (ids.length === apps.length) return resolve(apps)
          })
        }
      })
    })
  }

  /**
   * Update an app
   * @param {number} profileId The profile id to which the app is attached
   * @param {object} app The updated app
   */
  updateApp (profileId, app) {
    const id = app.id
    if (!id) throw Error('Missing id')

    return new Promise((resolve, reject) => {
      this.dbs.core.put(`/profiles/${profileId}/apps/${id}`, app, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }
}

export default Masq
