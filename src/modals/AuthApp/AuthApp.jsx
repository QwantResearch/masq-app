import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Loader, Card } from 'qwant-research-components'

import { Modal } from '../../components'
import { handleUserAppLogin, handleUserAppRegister, setCurrentAppRequest, fetchApps } from '../../actions'

import styles from './AuthApp.module.scss'

class AuthApp extends React.Component {
  constructor (props) {
    super(props)
    this.handleOk = this.handleOk.bind(this)
    this.handleRefuse = this.handleRefuse.bind(this)
    this.handleAccept = this.handleAccept.bind(this)
  }

  async componentDidMount () {
    const { channel, key, appId } = this.props.appRequest
    await this.props.handleUserAppLogin(channel, key, appId)
  }

  async componentDidUpdate (prevProps) {
    if (prevProps.appRequest.channel === this.props.appRequest.channel) {
      return
    }

    // Another appRequest has been received
    const { channel, key, appId } = this.props.appRequest
    await this.props.handleUserAppLogin(channel, key, appId)
  }

  async handleRefuse () {
    await this.props.handleUserAppRegister(false)
    await this.props.setCurrentAppRequest(null)
    this.props.onClose()
  }

  async handleAccept () {
    await this.props.handleUserAppRegister(true)
    await this.props.fetchApps() // The apps may be added
  }

  async handleOk () {
    // remove the app request
    await this.props.setCurrentAppRequest(null)
  }

  renderButtons () {
    const { appRequest } = this.props

    if (appRequest.isConnected === false) {
      return (
        <Fragment>
          <Button label={'Refuser'} onClick={this.handleRefuse} color={styles.colorRed} />
          <Button label={'Valider'} onClick={this.handleAccept} color={styles.colorGreen} />
        </Fragment>
      )
    }

    if (appRequest.isConnected) {
      return <Button label={'OK'} onClick={this.handleOk} color={styles.colorGreen} />
    }

    return <Loader />
  }

  renderText () {
    const { appRequest } = this.props

    if (appRequest.isConnected === false) {
      return (
        <div>
          <Card minHeight={64} title={appRequest.name} image={appRequest.imageURL} color={styles.colorPurple} description={appRequest.description} />
          <p className={styles.description}>
          Cette application demande un accès à votre stockage Masq.
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
    const { appRequest } = this.props
    const { isConnected } = appRequest

    return (
      <Modal width={511} height={isConnected === false ? 550 : 300}>
        <div className={styles.AuthApp}>
          <p className={styles.title}>Nouvelle requête de connexion de:</p>
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
