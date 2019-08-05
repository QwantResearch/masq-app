import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createHashHistory } from 'history'
import { Router, Route, Redirect } from 'react-router-dom'
import DetectBrowser from 'detect-browser'
import { withTranslation } from 'react-i18next'
import * as common from 'masq-common'

import { Login, Applications, Devices, Settings, Navbar, Loading } from './containers'
import { Notification } from './components'
import { addDevice, setCurrentAppRequest, setLoading, setNotification } from './actions'
import { AuthApp, PersistentStorageRequest, UnsupportedBrowser } from './modals'
import { isBrowserSupported } from './lib/browser'
import { capitalize } from './lib/utils'

import styles from './App.module.scss'

const history = createHashHistory()
const { MasqError } = common.errors

// listen for errors event and display them

const authenticatedRoutes = [
  {
    path: '/apps',
    sidebar: Navbar,
    main: Applications
  },
  {
    path: '/devices',
    sidebar: Navbar,
    main: Devices
  },
  {
    path: '/settings',
    sidebar: Navbar,
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
      persistentStorageRequest: false,
      messages: [],
      hash: null,
      prevPath: '',
      unsupportedBrowserModal: !isBrowserSupported()
    }

    this.handlePersistentStorageRequestClose = this.handlePersistentStorageRequestClose.bind(this)
  }

  async checkPersistentStorage () {
    const { name } = DetectBrowser.detect()
    if (name !== 'firefox') return

    if (!navigator.storage || !navigator.storage.persist) return
    const persistent = await navigator.storage.persisted()
    if (persistent) { return }

    this.setState({ persistentStorageRequest: true })
    const p = await navigator.storage.persist()
    if (p) {
      this.setState({ persistentStorageRequest: false })
    }
  }

  async componentDidMount () {
    console.log(`Masq version: ${process.env.REACT_APP_GIT_SHA}`)
    const { t } = this.props
    window.addEventListener('MasqError', (e) => {
      if (e.detail === MasqError.REPLICATION_SIGNALLING_ERROR) {
        this.props.setNotification({
          error: true,
          title: t('Connection failure, please retry.')
        })
      }
    })

    if (!this.props.devices.length) {
      const { name, os } = DetectBrowser.detect()
      this.props.addDevice({
        name: `${capitalize(name)} ${t('on')} ${os}`,
        description: t('This device'),
        color: '#40ae6c'
      })
    }

    history.listen(location => {
      const paths = ['/apps', '/devices', '/settings']
      if (location.pathname !== this.state.prevPath &&
        paths.includes(location.pathname)) {
        this.setState({
          prevPath: location.pathname
        })
      }
    })

    // this.checkPersistentStorage()

    this.props.setLoading(false)
  }

  handlePersistentStorageRequestClose () {
    this.setState({ persistentStorageRequest: false })
  }

  componentDidUpdate (prevProps) {
    const { prevPath } = this.state
    if (prevProps.loading && !this.props.loading) {
      history.push(prevPath)
    }
  }

  render () {
    const { persistentStorageRequest, unsupportedBrowserModal } = this.state
    const { currentUser, currentAppRequest, notification, setCurrentAppRequest, loading } = this.props
    const { pathname } = history.location

    if (unsupportedBrowserModal) {
      return <UnsupportedBrowser />
    }

    return (
      <Router history={history}>
        <div>
          {loading && pathname !== '/loading' && <Redirect to='/loading' />}
          {notification && <Notification {...notification} />}
          {currentUser && currentAppRequest &&
            <AuthApp
              onClose={() => setCurrentAppRequest(null)}
              appRequest={currentAppRequest}
            />
          }

          {persistentStorageRequest && <PersistentStorageRequest onClose={this.handlePersistentStorageRequestClose} />}

          <Route exact path='/link/:hash' component={Login} />
          <Route exact path='/' component={Login} />
          <Route path='/loading' component={Loading} />

          <div className={styles.layout}>
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
  notification: state.notification.currentNotification,
  loading: state.loading.loading
})

const mapDispatchToProps = dispatch => ({
  addDevice: device => dispatch(addDevice(device)),
  setCurrentAppRequest: app => dispatch(setCurrentAppRequest(app)),
  setLoading: value => dispatch(setLoading(value)),
  setNotification: notif => dispatch(setNotification(notif))
})

App.propTypes = {
  currentUser: PropTypes.object,
  currentAppRequest: PropTypes.object,
  setCurrentAppRequest: PropTypes.func,
  addDevice: PropTypes.func,
  devices: PropTypes.arrayOf(PropTypes.object),
  notification: PropTypes.object,
  loading: PropTypes.bool,
  setLoading: PropTypes.func,
  setNotification: PropTypes.func,
  t: PropTypes.func
}
const translatedApp = withTranslation()(App)
export default connect(mapStateToProps, mapDispatchToProps)(translatedApp)
