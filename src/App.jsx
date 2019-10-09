import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createHashHistory } from 'history'
import { Router, Route, Redirect } from 'react-router-dom'
import DetectBrowser from 'detect-browser'
import { withTranslation } from 'react-i18next'
import * as common from 'masq-common'

import { Login, Applications, Devices, Settings, Navbar, Loading, Sync } from './containers'
import { Notification } from './components'
import { getMasqInstance, refreshUser, addDevice, setCurrentAppRequest, setLoading, setNotification } from './actions'
import { AuthApp, PersistentStorageRequest, UnsupportedBrowser } from './modals'
import { isBrowserSupported } from './lib/browser'

import styles from './App.module.scss'

const history = createHashHistory()
const { MasqError } = common.errors

const authenticatedRoutes = [
  {
    path: '/apps',
    container: Applications
  },
  {
    path: '/devices',
    container: Devices
  },
  {
    path: '/settings',
    container: Settings
  }
]

const PrivateRoute = ({ component: Component, isAuthenticated, ...rest }) => {
  return (
    <Route
      {...rest}
      render={
        props => isAuthenticated
          ? <Component {...props} />
          : <Redirect to={{ pathname: '/', state: { from: history.location } }} />
      }
    />
  )
}

PrivateRoute.propTypes = {
  component: PropTypes.func,
  isAuthenticated: PropTypes.bool
}

class App extends Component {
  constructor () {
    super()

    this.dbMasqPrivate = null
    this.dbMasqPublic = null
    this.dbs = {} // all replicated dbs
    this.sw = null
    this.watchers = {}

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
    if (!prevProps.currentUser && this.props.currentUser) {
      const masq = getMasqInstance()
      const handleUpdate = async () => {
        await masq.updatePublicProfile()
        const updatedPrivateProdfile = await masq.getProfile()
        this.props.refreshUser(updatedPrivateProdfile.id, updatedPrivateProdfile)
      }
      this.watchers.profile = masq.addWatcher('/profile', handleUpdate)
    }
  }

  componentWillUnmount () {
    if (this.watchers.profile) {
      this.watchers.profile.destroy()
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
          <Route
            exact
            path='/sync/:hash'
            component={() => (
              <Sync
                link={window.location.href}
                onClose={() => currentUser ? history.push('/apps') : history.push('/')}
              />
            )}
          />
          <Route exact path='/link/:hash' component={Login} />
          <Route exact path='/' component={Login} />
          <Route path='/loading' component={Loading} />
          {authenticatedRoutes.map((route, index) => (
            <PrivateRoute
              key={index}
              path={route.path}
              isAuthenticated={!!currentUser}
              component={() => (
                <div className={styles.layout}>
                  <Navbar />
                  <route.container />
                </div>
              )}
            />
          ))}
          {loading && pathname !== '/loading' && <Redirect to='/loading' />}
          {notification && <Notification {...notification} />}
          {currentUser && currentAppRequest &&
            <AuthApp
              onClose={() => setCurrentAppRequest(null)}
              appRequest={currentAppRequest}
            />}

          {persistentStorageRequest && <PersistentStorageRequest onClose={this.handlePersistentStorageRequestClose} />}
        </div>
      </Router>
    )
  }
}

const mapStateToProps = state => ({
  currentAppRequest: state.masq.currentAppRequest,
  currentUser: state.masq.currentUser,
  users: state.masq.users,
  notification: state.notification.currentNotification,
  loading: state.loading.loading
})

const mapDispatchToProps = dispatch => ({
  refreshUser: (id, user) => dispatch(refreshUser(id, user)),
  addDevice: device => dispatch(addDevice(device)),
  setCurrentAppRequest: app => dispatch(setCurrentAppRequest(app)),
  setLoading: value => dispatch(setLoading(value)),
  setNotification: notif => dispatch(setNotification(notif))
})

App.propTypes = {
  currentUser: PropTypes.object,
  currentAppRequest: PropTypes.object,
  setCurrentAppRequest: PropTypes.func,
  refreshUser: PropTypes.func,
  addDevice: PropTypes.func,
  notification: PropTypes.object,
  loading: PropTypes.bool,
  setLoading: PropTypes.func,
  setNotification: PropTypes.func,
  t: PropTypes.func
}
const translatedApp = withTranslation()(App)
export default connect(mapStateToProps, mapDispatchToProps)(translatedApp)
