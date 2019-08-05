import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { setNotification } from '../../actions'
import { Avatar, Modal, Button, TextField, Typography, Space, PasswordStrength } from '../../components'
import { isName, isUsername, isForceEnough } from '../../lib/validators'
import { isUsernameAlreadyTaken, compressImage, MAX_IMAGE_SIZE } from '../../lib/utils'

import styles from './Signup.module.scss'

class Signup extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      image: '',
      lastname: '',
      firstname: '',
      username: '',
      password: '',
      passwordConfirmation: ''
    }

    this.currentStep = 0
    this.validationEnabled = false
    this.refAvatar = React.createRef()

    this.next = this.next.bind(this)
    this.finish = this.finish.bind(this)
    this.isValid = this.isValid.bind(this)
    this.previous = this.previous.bind(this)
    this.openDialog = this.openDialog.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
  }

  isValid (fieldName) {
    const field = this.state[fieldName]

    if (!this.validationEnabled) {
      // Don't show error as long as the user does not click Finish btn
      return true
    }

    switch (fieldName) {
      case 'image': return true
      case 'firstname': return isName(field)
      case 'lastname': return isName(field)
      case 'username': return isUsername(field) && !isUsernameAlreadyTaken(field)
      case 'password': return isForceEnough(field)
      case 'passwordConfirmation': return field === this.state.password
      default: return false
    }
  }

  getUsernameLabel (...labels) {
    const username = this.state['username']

    if (this.isValid('username')) {
      return labels[0]
    }

    return isUsernameAlreadyTaken(username) ? labels[1] : labels[2]
  }

  onChange (field, event) {
    const value = event.target.value.trim()
    this.setState({
      [field]: value
    })
  }

  async onImageChange (event) {
    const { setNotification, t } = this.props
    const reader = new window.FileReader()
    const file = event.target.files[0]
    if (!file) {
      return
    }

    const image = await compressImage(file)
    if (image.size > MAX_IMAGE_SIZE) {
      setNotification({ title: t('The selected picture is too big, make it smaller please.'), error: true })
      return
    }

    reader.addEventListener('load', () => {
      this.setState({ image: reader.result })
    })

    reader.readAsDataURL(image)
  }

  openDialog () {
    this.refAvatar.current.openDialog()
  }

  next () {
    const fieldsToValidate = ['lastname', 'firstname', 'username']
    this.validationEnabled = true

    const isValid = fieldsToValidate.every(key => this.isValid(key))

    // If invalid, return
    if (!isValid) {
      // forceUpdate to show errors
      return this.forceUpdate()
    }

    this.validationEnabled = false // do not display error on the next step for now
    this.currentStep++
    this.forceUpdate()
  }

  previous () {
    this.currentStep--
    this.forceUpdate()
  }

  finish () {
    const { onSignup } = this.props
    this.validationEnabled = true

    if (!this.isValid('password') || !this.isValid('passwordConfirmation')) {
      // forceUpdate to show errors
      return this.forceUpdate()
    }

    onSignup(this.state)
  }

  handleKeyUp (e) {
    if (e.key !== 'Enter') {
      return
    }

    if (this.currentStep === 0) {
      this.next()
    } else {
      this.finish()
    }
  }

  renderFirstStep () {
    const { t } = this.props
    return (
      <React.Fragment>
        <div className={styles.avatar}>
          <Avatar
            size={120}
            upload
            ref={this.refAvatar}
            onChange={(e) => this.onImageChange(e)}
            image={this.state.image || null}
            username={this.state.username}
          />

          <Space size={21} />
          <Button width={190} height={40} maxWidth={185} borderRadius={3} secondary onClick={this.openDialog}>{t('Import a picture')}</Button>
        </div>

        <Space size={32} />

        <TextField
          className={styles.TextField}
          defaultValue={this.state.username}
          error={!this.isValid('username')}
          onChange={(e) => this.onChange('username', e)}
          onKeyUp={this.handleKeyUp}
          label={this.getUsernameLabel(
            t('Username'),
            t('Username already used, please use another one'),
            t('The username must not contain spaces, and can contain only the following special characters: !?$#@()-*')
          )}
        />

        <Space size={32} />

        <div className={styles.buttons}>
          <Button onClick={this.next} width={185}>{t('Next')}</Button>
        </div>
      </React.Fragment>
    )
  }

  renderSecondStep () {
    const { t } = this.props
    const { password, passwordConfirmation } = this.state

    return (
      <React.Fragment>
        <Typography type='paragraph-modal' align='justify' inline>
          {t(`Define a secret key to encrypt your data, choose it with care. There is `)}
          <span className={styles.fontMedium}>{t(`NO WAY to recover this key in case you lose it, because you only know it.`)}</span>
        </Typography>
        <Space size={14} />
        <TextField
          password
          className={styles.TextField}
          defaultValue={password}
          autoFocus
          type='password'
          label={this.isValid('password')
            ? t('Secret key')
            : t('The secret key must contain at least 6 characters and respect two rules minimum.')}
          error={!this.isValid('password')}
          onChange={(e) => this.onChange('password', e)}
        />
        <Space size={14} />
        <PasswordStrength password={password} />
        <Space size={14} />
        <TextField
          password
          className={styles.TextField}
          type='password'
          defaultValue={passwordConfirmation}
          label={this.isValid('passwordConfirmation')
            ? t('Secret key confirmation')
            : t('Two secret keys do not match')}
          error={!this.isValid('passwordConfirmation')}
          onKeyUp={this.handleKeyUp}
          onChange={(e) => this.onChange('passwordConfirmation', e)}
        />

        <Space size={30} />

        <div className={styles.buttons}>
          <Button width={142} color='neutral' onClick={this.previous}>{t('Previous')}</Button>
          <Button width={142} onClick={this.finish}>{t('Finish')}</Button>
        </div>
      </React.Fragment>
    )
  }

  render () {
    const { t } = this.props

    return (
      <Modal onClose={this.props.onClose} padding={100} width={350}>
        <div className={styles.Signup}>
          <Typography type='title-modal'>{t('Create a new profile')}</Typography>
          <Space size={28} />
          {this.currentStep === 0 && this.renderFirstStep()}
          {this.currentStep === 1 && this.renderSecondStep()}
        </div>
      </Modal>
    )
  }
}

Signup.propTypes = {
  onSignup: PropTypes.func,
  onClose: PropTypes.func,
  setNotification: PropTypes.func,
  t: PropTypes.func
}

const mapDispatchToProps = dispatch => ({
  setNotification: (notif) => dispatch(setNotification(notif))
})

const translatedSignup = withTranslation()(Signup)
export default connect(null, mapDispatchToProps)(translatedSignup)
