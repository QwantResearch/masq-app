import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button } from 'qwant-research-components'

import { Modal } from '../../components'
import { createApp } from '../../actions'

import styles from './AuthApp.module.scss'

class AuthApp extends React.Component {
  constructor (props) {
    super(props)
    this.handleAccept = this.handleAccept.bind(this)
  }

  handleAccept () {
    // const channel = this.props.match.params.channel
    // this.props.createApp(this.props.match.params.app, channel)
  }

  render () {
    const { app, onClose } = this.props

    return (
      <Modal width={511} onClose={onClose}>
        <div className={styles.AuthApp}>
          <p className={styles.title}>Nouvelle requête de connexion de:</p>
          <p className={styles.appTitle}>{app.name}</p>
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

AuthApp.defaultProps = {
  app: { name: 'app test' }
}

AuthApp.propTypes = {
  app: PropTypes.object.isRequired,
  onClose: PropTypes.func
}

const mapStateToProps = state => ({
  currentUser: state.masq.currentUser
})

const mapDispatchToProps = (dispatch) => ({
  createApp: (channel, challenge, app) => dispatch(createApp(channel, challenge, app))
})

export default connect(mapStateToProps, mapDispatchToProps)(AuthApp)
