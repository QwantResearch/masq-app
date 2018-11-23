import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button } from 'qwant-research-components'

import { Modal } from '../../components'
import { createApp, setCurrentAppRequest } from '../../actions'

import styles from './AuthApp.module.scss'

class AuthApp extends React.Component {
  constructor (props) {
    super(props)
    this.handleAccept = this.handleAccept.bind(this)
  }

  componentDidMount () {
    const appName = this.props.match.params.app
    this.props.setCurrentAppRequest({ name: appName })
  }

  handleAccept () {
    const channel = this.props.match.params.channel
    this.props.createApp(this.props.match.params.app, channel)
  }

  render () {
    const { app } = this.props

    return (
      <Modal width={511}>
        <div className={styles.AuthApp}>
          <p className={styles.title}>New connection request from</p>
          <p className={styles.appTitle}>{app.name}</p>
          <p className={styles.description}>
            This notification appears because that application asks permission
            to use your Masq storage. Please verify that the security code match with the one of the app.
          </p>
          <p className={styles.description}>
            If you are not at the origin of this request or if you have question,
            please contact our help center.
          </p>

          <div className={styles.buttons}>
            <Button label={'Reject'} color={'var(--red-100)'} colorShadow={'var(--red-100-shadow)'} />
            <Button label={'Accept'} onClick={this.handleAccept} color={'var(--green-100)'} colorShadow={'var(--green-100-shadow)'} />
          </div>
        </div>
      </Modal>
    )
  }
}

AuthApp.defaultProps = {
  app: { name: 'app test' }
}

AuthApp.propTypes = {
  app: PropTypes.object.isRequired,
  setCurrentAppRequest: PropTypes.func,
  createApp: PropTypes.func,
  match: PropTypes.object
}

const mapStateToProps = state => ({
  currentUser: state.masq.currentUser,
  app: state.masq.currentAppRequest
})

const mapDispatchToProps = (dispatch) => ({
  createApp: (channel, challenge, app) => dispatch(createApp(channel, challenge, app)),
  setCurrentAppRequest: (app) => dispatch(setCurrentAppRequest(app))
})

export default connect(mapStateToProps, mapDispatchToProps)(AuthApp)
