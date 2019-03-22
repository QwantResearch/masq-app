import React, { Component } from 'react'
import { connect } from 'react-redux'
import { signin, signup, fetchUsers } from '../../actions'
import PropTypes from 'prop-types'
import { ChevronLeft } from 'react-feather'

import styles from './Login.module.scss'
import { ReactComponent as Logo } from '../../assets/logo.svg'
import { ReactComponent as Background } from '../../assets/background.svg'
import { ReactComponent as PlusSquare } from '../../assets/plus-square.svg'
import { Avatar, Button, TextField } from '../../components'

import { Signup, AddProfile, SyncDevice, QRCodeModal } from '../../modals'

const remoteWebRTCEnabled = (process.env.REACT_APP_REMOTE_WEBRTC === 'true')

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
      password: '',
      qrcodeModal: false
    }

    this.handleClickSyncProfile = this.handleClickSyncProfile.bind(this)
    this.handleClickNewProfile = this.handleClickNewProfile.bind(this)
    this.handleClickNewUser = this.handleClickNewUser.bind(this)
    this.onPasswordChange = this.onPasswordChange.bind(this)
    this.closeQRCodeModal = this.closeQRCodeModal.bind(this)
    this.openQRCodeModal = this.openQRCodeModal.bind(this)
    this.renderQRCode = this.renderQRCodeModal()
    this.onPasswordKeyUp = this.onPasswordKeyUp.bind(this)
    this.handleSignup = this.handleSignup.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.connect = this.connect.bind(this)
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
    if (e.key === 'Enter') {
      this.connect()
    }
  }

  async connect () {
    const { signin } = this.props
    const { password, selectedUser } = this.state
    try {
      await signin(selectedUser, password)
    } catch (e) {
      this.setState({ isWrongPassword: true })
    }
  }

  goBack () {
    this.setState({ selectedUser: null })
  }

  openQRCodeModal () {
    this.setState({ qrcodeModal: true })
  }

  closeQRCodeModal () {
    this.setState({ qrcodeModal: false })
  }

  renderQRCodeModal () {
    if (this.props.currentAppRequest && remoteWebRTCEnabled) {
      return (
        <div style={{ marginBottom: 32 }}>
          <Button label='Se connecter avec un autre appareil' onClick={this.openQRCodeModal} />
        </div>
      )
    }
  }

  renderUsersSelection () {
    const { users } = this.props
    const { isModalOpened, signup, sync, qrcodeModal } = this.state

    return (
      <div style={{ width: '100%' }}>
        {qrcodeModal && <QRCodeModal onClose={this.closeQRCodeModal} />}

        <Logo className={styles.Logo} />
        <h1 className='title-login'>Qui est-ce ?</h1>
        { this.renderQRCodeModal() }
        <div className={styles.users}>
          {users.map(user => (
            <div key={user.username} className={styles.user} onClick={() => this.selectUser(user)}>
              <Avatar {...user} />
              <p className='username'>{user.username}</p>
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
          <ChevronLeft style={{ cursor: 'pointer' }} />
          <p style={{ cursor: 'pointer' }}>Changer d'utilisateur</p>
        </div>

        <div className={styles.users}>
          <div key={selectedUser.username} className={styles.user}>
            <Avatar {...selectedUser} />
            <p className='username'>{selectedUser.username}</p>
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
          <div style={{ marginBottom: 32 }} />
          <Button label='connexion' onClick={this.connect} />
        </div>
      </div>
    )
  }

  componentDidUpdate () {
    if (this.props.user) {
      this.props.history.push('/apps')
    }
  }

  render () {
    const { selectedUser } = this.state

    return (
      <div className={styles.Login}>
        {selectedUser
          ? this.renderPassword()
          : this.renderUsersSelection()
        }

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
  signin: PropTypes.func,
  history: PropTypes.object,
  currentAppRequest: PropTypes.object
}

const mapStateToProps = state => ({
  user: state.masq.currentUser,
  users: state.masq.users,
  currentAppRequest: state.masq.currentAppRequest
})

const mapDispatchToProps = dispatch => ({
  signin: (user, passphrase) => dispatch(signin(user, passphrase)),
  signup: user => dispatch(signup(user)),
  fetchUsers: user => dispatch(fetchUsers(user))
})

export default connect(mapStateToProps, mapDispatchToProps)(Login)
