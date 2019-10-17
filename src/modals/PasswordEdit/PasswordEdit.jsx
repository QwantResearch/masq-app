import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import { updatePassphrase, setNotification } from '../../actions'
import { Modal, Button, TextField, Space, PasswordStrength } from '../../components'
import { isForceEnough } from '../../lib/validators'

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
    this.handleUpdatePassphrase = this.handleUpdatePassphrase.bind(this)
  }

  handleKeyUp (e) {
    if (e.key !== 'Enter') {
      return
    }
    this.handleUpdatePassphrase()
  }

  isValid (fieldName) {
    const field = this.state[fieldName]

    if (!this.state.showErrors) {
      // Don't show error as long as the user does not click Finish btn
      return true
    }

    switch (fieldName) {
      case 'password': return isForceEnough(field) && this.state.password !== this.state.currentPassword
      case 'passwordConfirmation': return field === this.state.password
      default: return false
    }
  }

  onChange (field, e) {
    this.setState({
      [field]: e.target.value
    })
  }

  async handleUpdatePassphrase () {
    const { currentPassword, password } = this.state
    const { t } = this.props
    this.validationEnabled = true

    this.setState({
      currentPasswordError: false
    })

    if (!isForceEnough(password) ||
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
        title: t('Secret key succesfully updated.')
      })
    } catch (err) {
      this.setState({
        currentPasswordError: true
      })
    }
  }

  render () {
    const { currentPassword, password, passwordConfirmation, currentPasswordError } = this.state
    const { onClose, username, t } = this.props

    return (
      <Modal title={t('Update your secret key')} mobileHeader onClose={onClose}>
        <form className={styles.PasswordEdit} onSubmit={this.handleUpdatePassphrase}>
          <input style={{ display: 'none' }} autoComplete='username' type='text' defaultValue={username} />
          <Space size={28} />
          <TextField
            password
            autoComplete='current-password'
            className={styles.TextField}
            defaultValue={currentPassword}
            autoFocus
            type='password'
            label={currentPasswordError
              ? t('Invalid secret key')
              : t('Current secret key')}
            error={currentPasswordError}
            onChange={(e) => this.onChange('currentPassword', e)}
          />
          <Space size={32} />
          <TextField
            password
            className={styles.TextField}
            type='password'
            autoComplete='new-password'
            defaultValue={password}
            label={this.isValid('password')
              ? t('New secret key')
              : t('The secret key must contain at least 6 characters, and be different from the old key')}
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
            autoComplete='new-password'
            defaultValue={passwordConfirmation}
            label={this.isValid('passwordConfirmation')
              ? t('Secret key confirmation')
              : t('Keys do not match')}
            error={!this.isValid('passwordConfirmation')}
            onKeyUp={this.handleKeyUp}
            onChange={(e) => this.onChange('passwordConfirmation', e)}
          />

          <Space size={30} />

          <div className={styles.buttons}>
            <Button width={142} type='button' color='neutral' onClick={onClose}>{t('Cancel')}</Button>
            <Button width={142} type='submit'>{t('Save')}</Button>
          </div>
        </form>
      </Modal>
    )
  }
}

PasswordEdit.propTypes = {
  username: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  updatePassphrase: PropTypes.func.isRequired,
  setNotification: PropTypes.func.isRequired,
  t: PropTypes.func
}

const mapStateToProps = (state) => ({
  username: state.masq.currentUser.username
})

const mapDispatchToProps = dispatch => ({
  updatePassphrase: (oldPass, newPass) => dispatch(updatePassphrase(oldPass, newPass)),
  setNotification: (notif) => dispatch(setNotification(notif))
})
const translatedPasswordEdit = withTranslation()(PasswordEdit)
export default connect(mapStateToProps, mapDispatchToProps)(translatedPasswordEdit)
