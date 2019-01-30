import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Loader } from 'qwant-research-components'

import { Modal } from '../../components'
import { handleUserAppLogin, handleUserAppRegister, setCurrentAppRequest, fetchApps } from '../../actions'

import styles from './AuthApp.module.scss'

class AuthApp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true
    }
    this.handleOk = this.handleOk.bind(this)
    this.handleRefuse = this.handleRefuse.bind(this)
    this.handleAccept = this.handleAccept.bind(this)
  }

  async componentDidMount () {
    const { channel, key, appId } = this.props.appRequest
    await this.props.handleUserAppLogin(channel, key, appId)
    this.setState({ loading: false })
  }

  async handleRefuse () {
    await this.props.handleUserAppRegister(false)
    await this.props.setCurrentAppRequest(null)
    this.props.onClose()
  }

  async handleAccept () {
    this.setState({ loading: true }, async () => {
      await this.props.handleUserAppRegister(true)
      this.setState({ loading: false })
      await this.props.fetchApps() // The apps may be added
    })
  }

  async handleOk () {
    // remove the app request
    await this.props.setCurrentAppRequest(null)
  }

  renderButtons () {
    const { loading } = this.state
    const { appRequest } = this.props

    if (loading) return <Loader />

    if (appRequest.isConnected === false) {
      return (
        <Fragment>
          <Button label={'Refuser'} onClick={this.handleRefuse} color='#e53b5b' />
          <Button label={'Valider'} onClick={this.handleAccept} color='#40ae6c' />
        </Fragment>
      )
    }

    if (appRequest.isConnected) {
      return <Button label={'OK'} onClick={this.handleOk} color='#40ae6c' />
    }
  }

  renderText () {
    const { appRequest } = this.props

    if (appRequest.isConnected === false) {
      return (
        <div>
          <p className={styles.description}>
          Cette notification apparait car cette application demande un accès à votre stockage Masq.
          </p>
          <p className={styles.description}>
          Si vous n’êtes pas à l’origine de cette demande, veuillez refuser cette requête.
          </p>
        </div>
      )
    } else {
      return (
        <div>
          <p className={styles.description}>
          Vous avez autorisé l'application à accéder à votre stockage Masq.
          </p>
          <p className={styles.description}>
          Vous pouvez désormais utiliser l'application.
          </p>
        </div>
      )
    }
  }

  render () {
    const { appRequest, onClose } = this.props

    return (
      <Modal width={511} height={400} onClose={onClose}>
        <div className={styles.AuthApp}>
          <p className={styles.title}>Nouvelle requête de connexion de:</p>
          <p className={styles.appTitle}>{appRequest.appId}</p>
          {this.renderText()}

          <div className={styles.buttons}>
            {this.renderButtons()}
          </div>
        </div>
      </Modal>
    )
  }
}

AuthApp.propTypes = {
  handleUserAppRegister: PropTypes.func.isRequired,
  handleUserAppLogin: PropTypes.func.isRequired,
  setCurrentAppRequest: PropTypes.func.isRequired,
  fetchApps: PropTypes.func.isRequired,
  appRequest: PropTypes.object.isRequired,
  onClose: PropTypes.func
}

const mapStateToProps = state => ({
  currentUser: state.masq.currentUser
})

const mapDispatchToProps = (dispatch) => ({
  handleUserAppLogin: (channel, key, appId) => dispatch(handleUserAppLogin(channel, key, appId)),
  handleUserAppRegister: (isAccepted) => dispatch(handleUserAppRegister(isAccepted)),
  setCurrentAppRequest: (app) => dispatch(setCurrentAppRequest(app)),
  fetchApps: () => dispatch(fetchApps())
})

export default connect(mapStateToProps, mapDispatchToProps)(AuthApp)
