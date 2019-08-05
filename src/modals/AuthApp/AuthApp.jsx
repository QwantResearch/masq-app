import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Slash } from 'react-feather'
import { withTranslation } from 'react-i18next'

import { ReactComponent as MapsIcon } from '../../assets/back-to-maps.svg'
import { Modal, Button, Card, Typography, Space } from '../../components'
import { handleUserAppLogin, handleUserAppRegister, setCurrentAppRequest, fetchApps, setLoading, setNotification } from '../../actions'

import styles from './AuthApp.module.scss'

class AuthApp extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      refused: false,
      loading: false
    }
    this.login = this.login.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleAccept = this.handleAccept.bind(this)
    this.handleRefuse = this.handleRefuse.bind(this)
    this.handleRefuseConfirm = this.handleRefuseConfirm.bind(this)
  }

  async componentDidMount () {
    await this.login()
  }

  async login () {
    const { appRequest, setLoading, setCurrentAppRequest, setNotification, handleUserAppLogin } = this.props
    const { channel, key, appId } = appRequest
    const { t } = this.props
    try {
      await handleUserAppLogin(channel, key, appId)
    } catch (err) {
      setLoading(false)
      setCurrentAppRequest(null)
      setNotification({
        error: true,
        title: t('Error during the connection with the application. Please retry.')
      })
    }
  }

  componentWillUnmount () {
    this.props.setLoading(false)
  }

  async componentDidUpdate (prevProps) {
    const { loading } = this.props

    if (!this.state.refused && !this.props.appRequest.isConnected) {
      if (loading === true) return
      this.props.setLoading(true)
    } else {
      if (loading === false) return
      this.props.setLoading(false)
    }

    if (prevProps.appRequest.channel === this.props.appRequest.channel) {
      return
    }

    // Another appRequest has been received
    this.login()
  }

  async handleRefuse () {
    this.setState({ refused: true })
  }

  async handleRefuseConfirm () {
    await this.props.handleUserAppRegister(false)
    await this.props.setCurrentAppRequest(null)
    this.props.onClose()
  }

  async handleAccept () {
    this.setState({ loading: true }, async () => {
      await this.props.handleUserAppRegister(true)
      await this.props.fetchApps() // The apps may be added
      this.setState({ loading: false })
    })
  }

  async handleOk () {
    // remove the app request
    await this.props.setCurrentAppRequest(null)
  }

  renderButtons () {
    const { appRequest, t } = this.props
    const { refused } = this.state

    if (refused) {
      return (
        <Button color='neutral' onClick={this.handleRefuseConfirm}>Fermer</Button>
      )
    }

    if (appRequest.isConnected === false) {
      return (
        <div className={styles.buttons}>
          <Button width={185} onClick={this.handleRefuse} color='danger'>{t('Refuse')}</Button>
          <Button width={185} onClick={this.handleAccept} color='success'>{t('Validate')}</Button>
        </div>
      )
    }

    if (appRequest.isConnected) {
      return <Button onClick={this.handleOk}>Ok</Button>
    }
  }

  renderText () {
    const { appRequest, t } = this.props
    const { refused } = this.state

    if (refused) {
      return (
        <div>
          <Slash size={114} color={styles.colorGrey300} />
          <Space size={28} />
          <Typography type='paragraph-modal' align='center'>`${t(`You have refused the access of the application`)} ${appRequest.appId} ${t(`to your Masq storage.`)}`</Typography>
          <Space size={12} />
        </div>
      )
    }

    if (appRequest.isConnected === undefined) return false

    if (appRequest.isConnected === false) {
      return (
        <div>
          <Typography type='paragraph-modal'>
            {t(`This application asks access to Masq.`)}
            {t(`If you are not the one who initiated this request, please refuse.`)}
          </Typography>
          <Space size={30} />
          <Card minHeight={64} title={appRequest.name} image={appRequest.imageURL} description={appRequest.description} />
          <Space size={40} />
        </div>
      )
    } else {
      return (
        <div>
          <MapsIcon />
          <Space size={28} />
          <Typography type='paragraph-modal' align='center'>{ `${t('You have authorized the application ')} ${appRequest.appId} ${t(' to get access to your Masq storage.')}` }</Typography>
          <Space size={12} />
        </div>
      )
    }
  }

  getTitle () {
    const { t, appRequest } = this.props
    if (this.state.refused) {
      return t('New connection request has been refused')
    }

    if (this.props.appRequest.isConnected === undefined) return false

    return this.props.appRequest.isConnected
      ? `${t('Go back to')} ${appRequest.appId}${t('!')} ${t('enjoy!')}`
      : t('New connection request')
  }

  render () {
    const { appRequest } = this.props
    const { refused, loading } = this.state

    if ((!refused && appRequest.isConnected === undefined) || loading) {
      return false
    }

    return (
      <Modal width={400}>
        <div className={styles.AuthApp}>
          <div className={styles.content}>
            <Typography type='title-modal'>{this.getTitle()}</Typography>
            <Space size={32} />
            {this.renderText()}
          </div>
          {this.renderButtons()}
        </div>
      </Modal>
    )
  }
}

AuthApp.propTypes = {
  handleUserAppRegister: PropTypes.func.isRequired,
  handleUserAppLogin: PropTypes.func.isRequired,
  setCurrentAppRequest: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  fetchApps: PropTypes.func.isRequired,
  appRequest: PropTypes.object.isRequired,
  onClose: PropTypes.func,
  loading: PropTypes.bool,
  setNotification: PropTypes.func.isRequired,
  t: PropTypes.func
}

const mapStateToProps = state => ({
  currentUser: state.masq.currentUser,
  loading: state.loading.loading
})

const mapDispatchToProps = (dispatch) => ({
  handleUserAppLogin: (channel, key, appId) => dispatch(handleUserAppLogin(channel, key, appId)),
  handleUserAppRegister: (isAccepted) => dispatch(handleUserAppRegister(isAccepted)),
  setCurrentAppRequest: (app) => dispatch(setCurrentAppRequest(app)),
  fetchApps: () => dispatch(fetchApps()),
  setLoading: value => dispatch(setLoading(value)),
  setNotification: notif => dispatch(setNotification(notif))
})

const translatedAuthApp = withTranslation()(AuthApp)
export default connect(mapStateToProps, mapDispatchToProps)(translatedAuthApp)
