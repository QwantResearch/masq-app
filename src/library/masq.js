import rai from 'random-access-idb'
import signalhub from 'signalhubws'
import hyperdb from 'hyperdb'
import swarm from 'webrtc-swarm'
import pump from 'pump'
import uuidv4 from 'uuid/v4'

const HUB_URL = 'localhost:8080'

class Masq {
  constructor () {
    this.dbMasqCore = null
    this.dbMasqProfiles = null
    this.dbs = {}
  }

  initDatabases () {
    this.dbMasqCore = hyperdb(rai('masq-core'), { valueEncoding: 'json' })
    this.dbMasqProfiles = hyperdb(rai('masq-profiles'), { valueEncoding: 'json' })

    this.dbMasqCore.on('ready', () => {
      this.dbMasqCore.get('apps', (err, nodes) => {
        if (err) return console.error(err)

        if (nodes[0]) {
          // Replicate all the apps DBs
          this.openAndReplicateDBs(nodes[0].value)
        }
      })
    })

    this.dbMasqProfiles.on('ready', () => {
      this.replicate(this.dbMasqProfiles)
    })
  }

  getApps () {
    return new Promise((resolve, reject) => {
      this.dbMasqCore.get('apps', (err, nodes) => {
        if (err) return reject(err)

        if (nodes[0]) {
          return resolve(nodes[0].value)
        }
      })
    })
  }

  openAndReplicateDBs (names) {
    for (let name of names) {
      const db = hyperdb(rai(name), { valueEncoding: 'json' })
      this.dbs[name] = db
      db.once('ready', () => this.replicate(db))
    }
  }

  replicate (db) {
    const discoveryKey = db.discoveryKey.toString('hex')
    const hub = signalhub(discoveryKey, [HUB_URL])
    const sw = swarm(hub)

    sw.on('peer', peer => {
      const stream = db.replicate({ live: true })
      pump(peer, stream, peer)
    })

    sw.on('disconnect', (peer, id) => {
      console.log(`${id} disconnected from the swarm DB`)
      // sw.close()
    })
  }

  // SWARM to authorize new apps
  joinSwarm (channel, app) {
    this.hub = signalhub(channel, ['localhost:8080'])
    this.sw = swarm(this.hub)

    this.sw.on('peer', (peer, id) => {
      peer.on('data', data => this.handleData(data, peer, app))
    })

    this.sw.on('disconnect', (peer, id) => {
      console.log(`peer ${id} disconnected.`)
    })
  }

  // 1) App requests a new db
  // 2) Masq instantiate a db, start replicating, and send the key needed to READ the db to the app
  // 3) The app starts to replicate, then sends its key to authorize it as a WRITER.
  handleData (data, peer, app) {
    let json = null
    try {
      json = JSON.parse(data)
    } catch (e) {
      console.error(e)
      return
    }

    const cmd = json.cmd
    // const app = json.app

    if (cmd === 'requestDB') {
      this.createAppDB(app, (err, db) => {
        if (err) return console.error(err)
        peer.send(JSON.stringify({
          cmd: 'key',
          key: db.key.toString('hex')
        }))
      })
      return
    }

    if (cmd === 'key') {
      return this.authorize(json.key, peer, app)
    }
  }

  authorize (key, peer, app) {
    this.dbs[app].authorize(Buffer.from(key), err => {
      if (err) return console.error(err)
      peer.send(JSON.stringify({ cmd: 'success' }))
    })
  }

  createApp (app, channel) {
    this.joinSwarm(channel, app)
  }

  createAppDB (name, cb) {
    if (this.dbs[name]) {
      // app DB is already shared
      return cb(null, this.dbs[name])
    }

    const db = hyperdb(rai(name), { valueEncoding: 'json' })

    this.dbs[name] = db
    this.dbMasqCore.put('apps', [name])
    // this.setState({ apps: [...this.state.apps, name] })
    db.on('ready', () => {
      this.replicate(db)
      cb(null, db)
    })
  }

  addUser (user) {
    return new Promise((resolve, reject) => {
      this.dbMasqCore.get('/users', (err, nodes) => {
        if (err) return reject(err)

        const ids = nodes[0] ? nodes[0].value : []
        const id = uuidv4()
        user['id'] = id
        const batch = [{
          type: 'put',
          key: '/users',
          value: [...ids, id]
        }, {
          type: 'put',
          key: `/users/${id}`,
          value: user
        }]

        this.dbMasqCore.batch(batch, (err) => {
          if (err) return reject(err)
          resolve()
        })
      })
    })
  }

  getUsers () {
    return new Promise((resolve, reject) => {
      this.dbMasqCore.get('/users', (err, nodes) => {
        if (err) return reject(err)
        if (!nodes[0]) return resolve([])

        const ids = nodes[0].value
        const users = []

        for (let id of ids) {
          this.dbMasqCore.get(`/users/${id}`, (err, nodes) => {
            users.push(nodes[0].value)
            if (err) return reject(err)
            if (ids.length === users.length) return resolve(users)
          })
        }
      })
    })
  }

  updateUser (id, user) {
    return new Promise((resolve, reject) => {
      this.dbMasqCore.put(`/users/${id}`, user, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }
}

export default Masq
