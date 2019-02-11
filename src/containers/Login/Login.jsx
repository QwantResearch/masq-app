import React, { Component } from 'react'
import { connect } from 'react-redux'
import { signin, signup, fetchUsers } from '../../actions'
import { Redirect } from 'react-router-dom'
import { TextField } from 'qwant-research-components'
import PropTypes from 'prop-types'

import styles from './Login.module.scss'
import { ReactComponent as Logo } from '../../assets/logo.svg'
import { ReactComponent as Background } from '../../assets/background.svg'
import { ReactComponent as PlusSquare } from '../../assets/plus-square.svg'
import { ReactComponent as Chevron } from '../../assets/chevron.svg'
import { Avatar } from '../../components'

import { Signup, AddProfile, SyncDevice } from '../../modals'

class Login extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedUser: null,
      isWrongPassword: false,
      isModalOpened: false,
      isLoggedIn: false,
      signup: false,
      sync: false,
      password: ''
    }

    this.handleClickSyncProfile = this.handleClickSyncProfile.bind(this)
    this.handleClickNewProfile = this.handleClickNewProfile.bind(this)
    this.handleClickNewUser = this.handleClickNewUser.bind(this)
    this.onPasswordChange = this.onPasswordChange.bind(this)
    this.onPasswordKeyUp = this.onPasswordKeyUp.bind(this)
    this.handleSignup = this.handleSignup.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.goBack = this.goBack.bind(this)
  }

  componentDidMount () {
    this.props.fetchUsers()
  }

  handleClickNewUser () {
    this.setState({
      isModalOpened: !this.state.isModalOpened
    })
  }

  handleClose () {
    this.setState({
      isModalOpened: false,
      signup: false,
      sync: false
    })
  }

  handleSignup (user) {
    const { signup } = this.props
    signup(user)
    this.setState({ isModalOpened: false, signup: false })
  }

  handleClickNewProfile () {
    this.setState({ isModalOpened: false, signup: true })
  }

  handleClickSyncProfile () {
    this.setState({ isModalOpened: false, sync: true })
  }

  selectUser (user) {
    this.setState({ selectedUser: user })
  }

  onPasswordChange (e) {
    this.setState({
      password: e.target.value
    })
  }

  async onPasswordKeyUp (e) {
    const { signin } = this.props
    const { password, selectedUser } = this.state
    if (e.key === 'Enter') {
      try {
        await signin(selectedUser, password)
      } catch (e) {
        this.setState({ isWrongPassword: true })
      }
    }
  }

  goBack () {
    this.setState({ selectedUser: null })
  }

  renderUsersSelection () {
    const { users } = this.props
    const { isModalOpened, signup, sync } = this.state

    return (
      <div style={{ width: '100%' }}>
        <Logo className={styles.Logo} />
        <h1 className={styles.title}>Qui est-ce ?</h1>
        <div className={styles.users}>
          {users.map(user => (
            <div key={user.username} className={styles.user} onClick={() => this.selectUser(user)}>
              <Avatar {...user} />
              <h2>{user.username}</h2>
            </div>
          ))}
          <PlusSquare className={styles.PlusSquare} onClick={this.handleClickNewUser} />
        </div>
        {signup && <Signup onSignup={this.handleSignup} onClose={this.handleClose} />}
        {sync && <SyncDevice onClose={this.handleClose} />}
        {isModalOpened && (
          <AddProfile
            onClose={this.handleClose}
            onNewProfile={this.handleClickNewProfile}
            onSyncProfile={this.handleClickSyncProfile}
          />
        )}
      </div>
    )
  }

  renderPassword () {
    const { selectedUser } = this.state

    return (
      <div style={{ width: '100%' }}>
        <Logo className={styles.Logo} />

        <div className={styles.goback} onClick={this.goBack}>
          <Chevron style={{ transform: 'rotate(90deg)', cursor: 'pointer' }} />
          <p style={{ cursor: 'pointer' }}>Changer d'utilisateur</p>
        </div>

        <div className={styles.users}>
          <div key={selectedUser.username} className={styles.user}>
            <Avatar {...selectedUser} />
            <h2>{selectedUser.username}</h2>
          </div>
        </div>

        <div className={styles.passwordSection}>
          <p>Entrez votre mot de passe</p>
          <TextField
            autoFocus
            type='password'
            onChange={this.onPasswordChange}
            error={this.state.isWrongPassword}
            label={this.state.isWrongPassword ? 'Mauvais mot de passe, veuillez réessayer' : ''}
            onKeyUp={this.onPasswordKeyUp}
          />
        </div>
      </div>
    )
  }

  render () {
    const { user } = this.props
    const { selectedUser } = this.state

    if (user) return <Redirect to='/apps' />

    return (
      <div className={styles.Login}>
        {selectedUser
          ? this.renderPassword()
          : this.renderUsersSelection()}
        <Background className={styles.Background} />
      </div>
    )
  }
}

Login.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object),
  user: PropTypes.object,
  fetchUsers: PropTypes.func,
  signup: PropTypes.func,
  signin: PropTypes.func
}

const mapStateToProps = state => ({
  user: state.masq.currentUser,
  users: state.masq.users
})

const mapDispatchToProps = dispatch => ({
  signin: (user, passphrase) => dispatch(signin(user, passphrase)),
  signup: user => dispatch(signup(user)),
  fetchUsers: user => dispatch(fetchUsers(user))
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)
