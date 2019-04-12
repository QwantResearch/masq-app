import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { setNotification } from '../../actions'
import { Avatar, Modal, Button, TextField, Typography, Space, PasswordStrength } from '../../components'
import { isName, isUsername, isPassword, isForceEnough } from '../../library/validators'
import { isUsernameAlreadyTaken, compressImage, MAX_IMAGE_SIZE } from '../../library/utils'
import defaultAvatar from '../../assets/user.png'

import styles from './Signup.module.scss'

class Signup extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      image: defaultAvatar,
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
      case 'password': return isPassword(field) && isForceEnough(field)
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
    const { setNotification } = this.props
    const reader = new window.FileReader()
    const file = event.target.files[0]
    if (!file) {
      return
    }

    const image = await compressImage(file)
    if (image.size > MAX_IMAGE_SIZE) {
      setNotification({ title: 'L\'image sélectionnée est trop lourde. Veuillez en choisir une autre.', error: true })
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
    return (
      <React.Fragment>
        <div className={styles.avatar}>
          <Avatar
            size={120}
            upload
            ref={this.refAvatar}
            onChange={(e) => this.onImageChange(e)}
            image={this.state.image || null}
          />

          <Space size={21} />
          <Button width={185} secondary onClick={this.openDialog}>Importer une photo</Button>
        </div>

        <Space size={32} />

        <TextField
          className={styles.TextField}
          defaultValue={this.state.username}
          error={!this.isValid('username')}
          onChange={(e) => this.onChange('username', e)}
          onKeyUp={this.handleKeyUp}
          label={this.getUsernameLabel(
            'Votre pseudo',
            'Pseudo déjà utilisé. Veuillez en choisir un autre.',
            'Le pseudo ne doit pas contenir d\'espaces, et peut contenir les caractères spéciaux suivants: !?$#@()-*'
          )}
        />

        <Space size={32} />

        <div className={styles.buttons}>
          <Button onClick={this.next} width={185}>Suivant</Button>
        </div>
      </React.Fragment>
    )
  }

  renderSecondStep () {
    return (
      <React.Fragment>
        <Typography type='paragraph-modal' align='justify'>
        Définissez une clé secrète pour chiffrer vos données, choisissez-la avec attention.
        Il n’y a aucun moyen de la récupérer en cas d'oubli car vous seul(e) la connaissez.
        </Typography>
        <Space size={14} />
        <TextField
          className={styles.TextField}
          autoFocus
          type='password'
          label={this.isValid('password')
            ? 'clé secrète'
            : 'Le mot de passe doit être composé d\'au moins 6 caractères.'}
          error={!this.isValid('password')}
          onChange={(e) => this.onChange('password', e)}
        />
        <Space size={14} />
        <PasswordStrength password={this.state.password} />
        <Space size={14} />
        <TextField
          className={styles.TextField}
          type='password'
          label={this.isValid('passwordConfirmation')
            ? 'Confirmation de la clé secrète'
            : 'Les mots de passe ne correspondent pas.'}
          error={!this.isValid('passwordConfirmation')}
          onKeyUp={this.handleKeyUp}
          onChange={(e) => this.onChange('passwordConfirmation', e)}
        />

        <Space size={30} />

        <div className={styles.buttons}>
          <Button width={142} color='neutral' onClick={this.previous}>Précédent</Button>
          <Button width={142} onClick={this.finish}>Terminer</Button>
        </div>
      </React.Fragment>
    )
  }

  render () {
    return (
      <Modal onClose={this.props.onClose} width={511}>
        <div className={styles.Signup}>
          <Typography type='title-modal'>Créer un nouveau profil</Typography>
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
  setNotification: PropTypes.func
}

const mapDispatchToProps = dispatch => ({
  setNotification: (notif) => dispatch(setNotification(notif))
})

export default connect(null, mapDispatchToProps)(Signup)
