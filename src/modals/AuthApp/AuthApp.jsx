import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button } from 'qwant-research-components'

import { Modal } from '../../components'
import { handleUserAppLogin } from '../../actions'

import styles from './AuthApp.module.scss'

class AuthApp extends React.Component {
  constructor (props) {
    super(props)
    this.handleAccept = this.handleAccept.bind(this)
  }

  async handleAccept () {
    const { onClose } = this.props
    const { channel, key, appId } = this.props.appRequest
    await this.props.handleUserAppLogin(channel, key, appId)
    onClose()
  }

  render () {
    const { appRequest, onClose } = this.props

    return (
      <Modal width={511} onClose={onClose}>
        <div className={styles.AuthApp}>
          <p className={styles.title}>Nouvelle requête de connexion de:</p>
          <p className={styles.appTitle}>{appRequest.appId}</p>
          <p className={styles.description}>
          Cette notification apparait car cette application demande un accès à votre stockage Masq.
          </p>
          <p className={styles.description}>
          Si vous n’êtes pas à l’origine de cette demande, veuillez refuser cette requête.
          </p>

          <div className={styles.buttons}>
            <Button label={'Refuser'} onClick={onClose} color='#e53b5b' />
            <Button label={'Valider'} onClick={this.handleAccept} color='#40ae6c' />
          </div>
        </div>
      </Modal>
    )
  }
}

AuthApp.propTypes = {
  handleUserAppLogin: PropTypes.func.isRequired,
  appRequest: PropTypes.object.isRequired,
  onClose: PropTypes.func
}

const mapStateToProps = state => ({
  currentUser: state.masq.currentUser
})

const mapDispatchToProps = (dispatch) => ({
  handleUserAppLogin: (channel, key, appId) => dispatch(handleUserAppLogin(channel, key, appId))
})

export default connect(mapStateToProps, mapDispatchToProps)(AuthApp)
