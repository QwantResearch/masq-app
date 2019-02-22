import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createHashHistory } from 'history'
import { Router, Route, Redirect } from 'react-router-dom'

import { Login, Apps, Devices, Settings, Sidebar } from './containers'
import { NotificationMasq } from './components'
import { addDevice, setCurrentAppRequest } from './actions'
import { AuthApp } from './modals'

const history = createHashHistory()

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

function capitalize (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

class App extends Component {
  constructor () {
    super()

    this.dbMasqPrivate = null
    this.dbMasqPublic = null
    this.dbs = {} // all replicated dbs
    this.sw = null

    this.state = {
      messages: [],
      hash: null,
      prevPath: ''
    }

    this.processLink = this.processLink.bind(this)
  }

  async componentDidMount () {
    console.log(`Masq version: ${process.env.REACT_APP_GIT_SHA}`)

    if (!this.props.devices.length) {
      const { name, os } = require('detect-browser').detect()
      this.props.addDevice({
        name: `${capitalize(name)} sur ${os}`,
        description: 'Cet appareil',
        color: '#40ae6c'
      })
    }

    history.listen(location => {
      if (location.pathname !== this.state.prevPath) {
        this.setState({
          prevPath: history.location.pathname
        })
      }
    })
  }

  processLink () {
    const { setCurrentAppRequest, currentUser } = this.props
    const hash = window.location.hash.substr(7) // ignore #/link/ characters

    if (!hash.length) return

    const decoded = Buffer.from(hash, 'base64')

    try {
      const [ appId, msg, channel, key ] = JSON.parse(decoded) // eslint-disable-line
      setCurrentAppRequest({ appId, channel, key })
    } catch (e) {
      console.error(e)
    }

    if (currentUser) {
      return <Redirect to={this.state.prevPath} />
    }

    return <Redirect to='/' />
  }

  render () {
    const { currentUser, currentAppRequest, notification, setCurrentAppRequest } = this.props

    return (
      <Router history={history}>
        <div>
          {notification && <NotificationMasq {...notification} />}
          {currentUser && currentAppRequest &&
            <AuthApp
              onClose={() => setCurrentAppRequest(null)}
              appRequest={currentAppRequest}
            />
          }

          <Route exact path='/link/:hash' component={this.processLink} />

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
  currentAppRequest: state.masq.currentAppRequest,
  currentUser: state.masq.currentUser,
  devices: state.masq.devices,
  users: state.masq.users,
  notification: state.notification.currentNotification
})

const mapDispatchToProps = dispatch => ({
  addDevice: device => dispatch(addDevice(device)),
  setCurrentAppRequest: app => dispatch(setCurrentAppRequest(app))
})

App.propTypes = {
  currentUser: PropTypes.object,
  currentAppRequest: PropTypes.object,
  setCurrentAppRequest: PropTypes.func,
  addDevice: PropTypes.func,
  devices: PropTypes.arrayOf(PropTypes.object),
  notification: PropTypes.object
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
