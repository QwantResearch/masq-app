import rai from 'random-access-idb'
import signalhub from 'signalhub'
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
      console.log('replicate!!!')
      const stream = db.replicate({ live: true })
      pump(peer, stream, peer)
    })

    sw.on('disconnect', (peer, id) => {
      console.log(`${id} disconnected from the swarm DB`)
    })
  }

  // SWARM to authorize new apps
  joinSwarm (key) {
    this.hub = signalhub('swarm-example-masq', ['localhost:8080'])
    this.sw = swarm(this.hub)

    this.sw.on('peer', (peer, id) => {
      this.appendMessage(`peer ${id} joined.`)
      peer.on('data', data => this.handleData(data, peer))
    })

    this.sw.on('disconnect', (peer, id) => {
      this.appendMessage(`peer ${id} disconnected.`)
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
