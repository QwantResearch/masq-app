import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { HashRouter as Router, Route } from 'react-router-dom'

import { Login, Apps, Devices, Settings, Sidebar } from './containers'
import { addDevice, createApp, setCurrentAppRequest } from './actions'
import { AuthApp } from './modals'

const authenticatedRoutes = [
  {
    path: '/apps',
    sidebar: Sidebar,
    main: Apps
  },
  {
    path: '/devices',
    sidebar: Sidebar,
    main: Devices
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
      messages: [],
      hash: null
    }

    this.handleInput = this.handleInput.bind(this)
  }

  async componentDidMount () {
    this.props.setCurrentAppRequest({ name: 'Test app' })

    if (!this.props.devices.length) {
      const { name, os } = require('detect-browser').detect()
      this.props.addDevice({
        name: `${name} sur ${os}`,
        description: 'Cet appareil',
        color: '#40ae6c'
      })
    }

    const url = new URL(window.location.href)
    const channel = url.searchParams.get('channel')
    const challenge = url.searchParams.get('challenge')
    const app = url.searchParams.get('appName')
    const profileId = url.searchParams.get('profileID')

    if (channel && challenge && app && profileId) {
      this.props.createApp(channel, challenge, app, profileId)
    }
  }

  appendMessage (msg) {
    this.setState({ messages: [...this.state.messages, msg] })
  }

  handleInput (e) {
    this.setState({ input: e.target.value })
  }

  render () {
    const { currentUser, currentAppRequest } = this.props
    return (
      <Router>
        <div>
          {currentUser && currentAppRequest &&
            <AuthApp
              onClose={() => this.props.setCurrentAppRequest(null)}
              app={currentAppRequest}
            />
          }
          <Route exact path='/' component={Login} />

          {/* <Route path='/registerapp/:channel/:challenge/:app' component={AuthApp} /> */}

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
  currentAppRequest: state.masq.currentAppRequest,
  currentUser: state.masq.currentUser,
  devices: state.masq.devices,
  users: state.masq.users
})

const mapDispatchToProps = dispatch => ({
  addDevice: (device) => dispatch(addDevice(device)),
  setCurrentAppRequest: (app) => dispatch(setCurrentAppRequest(app)),
  createApp: (channel, challenge, app, profileId) => dispatch(createApp(channel, challenge, app, profileId))
})

App.propTypes = {
  currentUser: PropTypes.object,
  currentAppRequest: PropTypes.object,
  setCurrentAppRequest: PropTypes.func,
  addDevice: PropTypes.func,
  devices: PropTypes.arrayOf(PropTypes.object),
  createApp: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
