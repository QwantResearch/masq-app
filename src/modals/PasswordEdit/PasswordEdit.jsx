import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { updatePassphrase, setNotification } from '../../actions'
import { Modal, Button, TextField, Typography, Space, PasswordStrength } from '../../components'
import { isPassword, isForceEnough } from '../../library/validators'

import styles from './PasswordEdit.module.scss'

class PasswordEdit extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      currentPassword: '',
      password: '',
      passwordConfirmation: '',
      showErrors: false,
      currentPasswordError: false
    }

    this.onChange = this.onChange.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.updatePassphrase = this.updatePassphrase.bind(this)
  }

  handleKeyUp (e) {
    if (e.key !== 'Enter') {
      return
    }
    this.updatePassphrase()
  }

  isValid (fieldName) {
    const field = this.state[fieldName]

    if (!this.state.showErrors) {
      // Don't show error as long as the user does not click Finish btn
      return true
    }

    switch (fieldName) {
      case 'password': return isPassword(field) && isForceEnough(field) && this.state.password !== this.state.currentPassword
      case 'passwordConfirmation': return field === this.state.password
      default: return false
    }
  }

  onChange (field, e) {
    this.setState({
      [field]: e.target.value
    })
  }

  async updatePassphrase () {
    const { currentPassword, password } = this.state

    this.validationEnabled = true

    this.setState({
      currentPasswordError: false
    })

    if (!isPassword(password) ||
        !isForceEnough(password) ||
        (password === currentPassword)) {
      return this.setState({
        showErrors: true
      })
    }

    try {
      await this.props.updatePassphrase(currentPassword, password)
      this.props.onClose()
      this.props.setNotification({
        error: false,
        title: 'Clé secrète mise à jour avec succès.'
      })
    } catch (err) {
      this.setState({
        currentPasswordError: true
      })
    }
  }

  render () {
    const { currentPassword, password, passwordConfirmation, currentPasswordError } = this.state
    const { onClose } = this.props

    return (
      <Modal onClose={onClose} width={511}>
        <div className={styles.PasswordEdit}>
          <Typography type='title-modal'>Modifier votre clé secrète</Typography>
          <Space size={28} />
          <TextField
            password
            className={styles.TextField}
            defaultValue={currentPassword}
            autoFocus
            type='password'
            label={currentPasswordError
              ? 'Clé secrète invalide'
              : 'Clé secrète actuelle'}
            error={currentPasswordError}
            onChange={(e) => this.onChange('currentPassword', e)}
          />
          <Space size={32} />
          <TextField
            password
            className={styles.TextField}
            type='password'
            defaultValue={password}
            label={this.isValid('password')
              ? 'Nouvelle clé secrète'
              : 'La clé secrète doit être composé d\'au moins 6 caractères, et être différent de l\'ancienne clé.'}
            error={!this.isValid('password')}
            onKeyUp={this.handleKeyUp}
            onChange={(e) => this.onChange('password', e)}
          />
          <Space size={10} />
          <PasswordStrength password={password} />
          <Space size={14} />
          <TextField
            password
            className={styles.TextField}
            type='password'
            defaultValue={passwordConfirmation}
            label={this.isValid('passwordConfirmation')
              ? 'Confirmation de la clé secrète'
              : 'Les clés ne correspondent pas.'}
            error={!this.isValid('passwordConfirmation')}
            onKeyUp={this.handleKeyUp}
            onChange={(e) => this.onChange('passwordConfirmation', e)}
          />

          <Space size={30} />

          <div className={styles.buttons}>
            <Button width={142} color='neutral' onClick={onClose}>Annuler</Button>
            <Button width={142} onClick={this.updatePassphrase}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
    )
  }
}

PasswordEdit.propTypes = {
  onClose: PropTypes.func,
  updatePassphrase: PropTypes.func.isRequired,
  setNotification: PropTypes.func.isRequired
}

const mapDispatchToProps = dispatch => ({
  updatePassphrase: (oldPass, newPass) => dispatch(updatePassphrase(oldPass, newPass)),
  setNotification: (notif) => dispatch(setNotification(notif))
})

export default connect(null, mapDispatchToProps)(PasswordEdit)
