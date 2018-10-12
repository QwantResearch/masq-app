import React, { Component } from 'react'
import rai from 'random-access-idb'
import hyperdb from 'hyperdb'
import signalhub from 'signalhubws'
import swarm from 'webrtc-swarm'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { Login, Apps, Settings, Sidebar } from './containers'

const authenticatedRoutes = [
  {
    path: '/apps',
    sidebar: Sidebar,
    main: Apps
  },
  {
    path: '/devices',
    sidebar: Sidebar,
    main: Apps
  },
  {
    path: '/settings',
    sidebar: Sidebar,
    main: Settings
  }
]

class App extends Component {
  constructor () {
    super()

    this.dbMasqPrivate = null
    this.dbMasqPublic = null
    this.dbs = {} // all replicated dbs
    this.sw = null

    this.state = {
      apps: [],
      user: '',
      messages: [],
      hash: null
    }

    this.handleInput = this.handleInput.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  async componentDidMount () {
  }

  appendMessage (msg) {
    this.setState({ messages: [...this.state.messages, msg] })
  }

  createApp (name, cb) {
    if (this.dbs[name]) {
      // app DB is already shared
      return cb(null, this.dbs[name])
    }

    const db = hyperdb(rai(name), { valueEncoding: 'json' })

    this.dbs[name] = db
    this.dbMasqPrivate.put('apps', [...this.state.apps, name])
    this.setState({ apps: [...this.state.apps, name] })
    db.on('ready', () => {
      this.replicate(db)
      cb(null, db)
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

  // 1) App requests a new db
  // 2) Masq instantiate a db, start replicating, and send the key needed to READ the db to the app
  // 3) The app starts to replicate, then sends its key to authorize it as a WRITER.
  handleData (data, peer) {
    let json = null
    try {
      json = JSON.parse(data)
    } catch (e) {
      console.error(e)
      return
    }

    const cmd = json.cmd
    const app = json.app

    if (cmd === 'requestDB') {
      this.createApp(app, (err, db) => {
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
      this.appendMessage('write access authorized')
      peer.send(JSON.stringify({ cmd: 'success' }))
    })
  }

  handleInput (e) {
    this.setState({ input: e.target.value })
  }

  handleClick () {
    this.createApp(this.state.input)
  }

  render () {
    console.log(this.props)

    return (
      <Router>
        <div>
          <Route exact path='/' component={Login} />

          <div style={{ display: 'flex' }}>
            {authenticatedRoutes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                component={route.sidebar}
              />
            ))}

            {authenticatedRoutes.map((route, index) => (
              <Route
                key={index}
                path={route.path}
                component={route.main}
              />
            ))}
          </div>
        </div>
      </Router>
    )
  }
}

const mapStateToProps = state => ({
  currentUser: state.masq.currentUser,
  users: state.masq.users
})

export default connect(mapStateToProps)(App)
