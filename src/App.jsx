import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import { Login, Apps, Devices, Settings, Sidebar } from './containers'
import { AuthApp } from './modals'
import { fetchApps } from './actions'

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
      apps: [],
      user: '',
      messages: [],
      hash: null
    }

    this.handleInput = this.handleInput.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  async componentDidMount () {
    this.props.fetchApps()
  }

  appendMessage (msg) {
    this.setState({ messages: [...this.state.messages, msg] })
  }

  handleInput (e) {
    this.setState({ input: e.target.value })
  }

  handleClick () {
    this.createApp(this.state.input)
  }

  render () {
    return (
      <Router>
        <div>
          <Route exact path='/' component={Login} />

          <Route path='/registerapp/:channel/:challenge/:app' component={AuthApp} />

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

const mapDispatchToProps = dispatch => ({
  fetchApps: () => dispatch(fetchApps())
})

App.propTypes = {
  fetchApps: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
