import rai from 'random-access-idb'
import signalhub from 'signalhubws'
import hyperdb from 'hyperdb'
import swarm from 'webrtc-swarm'
import pump from 'pump'
import uuidv4 from 'uuid/v4'

const HUB_URL = 'localhost:8080'

class Masq {
  constructor () {
    this.dbMasqPrivate = null
    this.dbMasqPublic = null
    this.dbs = {}
  }

  initDatabases () {
    this.dbMasqPrivate = hyperdb(rai('masq-private'), { valueEncoding: 'json' })
    this.dbMasqPublic = hyperdb(rai('masq-public'), { valueEncoding: 'json' })

    this.dbMasqPrivate.on('ready', () => {
      console.log('masq-private db ready')

      this.dbMasqPrivate.get('apps', (err, nodes) => {
        if (err) return console.error(err)

        if (nodes[0]) {
          // Replicate all the apps DBs
          this.openAndReplicateDBs(nodes[0].value)
        }
      })
    })

    this.dbMasqPublic.on('ready', () => {
      console.log('masq-public db ready')
      this.replicate(this.dbMasqPublic)
    })
  }

  getApps () {
    return new Promise((resolve, reject) => {
      this.dbMasqPrivate.get('apps', (err, nodes) => {
        if (err) return reject(err)

        if (nodes[0]) {
          console.log('masq getApps', nodes[0].value)
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

    console.log(`will replicate db with discoveryKey ${discoveryKey}`)

    sw.on('peer', peer => {
      console.log('replicate!!!', db.discoveryKey.toString('hex'))
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
    console.log('joinSwarm', channel)
    this.hub = signalhub(channel, ['localhost:8080'])
    this.sw = swarm(this.hub)

    this.sw.on('peer', (peer, id) => {
      console.log(`peer ${id} joined.`)
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
    console.log('app name', app)

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
    console.log('masq authorize', app)
    this.dbs[app].authorize(Buffer.from(key), err => {
      if (err) return console.error(err)
      console.log('write access authorized')
      peer.send(JSON.stringify({ cmd: 'success' }))
    })
  }

  createApp (app, channel) {
    console.log('####', app, channel)
    this.joinSwarm(channel, app)
  }

  createAppDB (name, cb) {
    console.log('masq createAppDB', name)
    if (this.dbs[name]) {
      // app DB is already shared
      return cb(null, this.dbs[name])
    }

    const db = hyperdb(rai(name), { valueEncoding: 'json' })

    this.dbs[name] = db
    this.dbMasqPrivate.put('apps', [name])
    // this.setState({ apps: [...this.state.apps, name] })
    db.on('ready', () => {
      console.log('db', name, 'success')
      this.replicate(db)
      cb(null, db)
    })
  }

  addUser (user) {
    return new Promise((resolve, reject) => {
      console.log('masq addUser()', user)
      this.dbMasqPrivate.get('/users', (err, nodes) => {
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

        this.dbMasqPrivate.batch(batch, (err) => {
          if (err) return reject(err)
          resolve()
        })
      })
    })
  }

  getUsers () {
    return new Promise((resolve, reject) => {
      this.dbMasqPrivate.get('/users', (err, nodes) => {
        if (err) return reject(err)
        if (!nodes[0]) return resolve([])

        const ids = nodes[0].value
        const users = []

        for (let id of ids) {
          this.dbMasqPrivate.get(`/users/${id}`, (err, nodes) => {
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
      this.dbMasqPrivate.put(`/users/${id}`, user, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }
}

export default Masq
