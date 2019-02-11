import React from 'react'
import PropTypes from 'prop-types'
import { Button, TextField } from 'qwant-research-components'
import { connect } from 'react-redux'

import { setNotification } from '../../actions'
import { Avatar, Modal } from '../../components'
import { isName, isUsername, isPassword } from '../../library/validators'
import { isUsernameAlreadyTaken, compressImage, MAX_IMAGE_SIZE } from '../../library/utils'

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
      case 'password': return isPassword(field)
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

  render () {
    return (
      <Modal onClose={this.props.onClose} height={650} width={511}>
        <div className={styles.Signup}>
          <span className={styles.title}>Ajouter un nouvel utilisateur</span>

          {this.currentStep === 0 && (
            <React.Fragment>
              <Avatar
                size={120}
                upload
                ref={this.refAvatar}
                onChange={(e) => this.onImageChange(e)}
                image={this.state.image || null}
              />

              <div style={{ paddingTop: 24 }} />
              <Button secondary label='Importer une photo' onClick={this.openDialog} />
              <div style={{ paddingBottom: 32 }} />

              <TextField
                className={styles.TextField}
                defaultValue={this.state.lastname}
                label={this.isValid('lastname')
                  ? 'Nom'
                  : 'Le nom ne peut être vide, et ne peut contenir que des caractères alphanumériques et des espaces.'}
                error={!this.isValid('lastname')}
                onChange={(e) => this.onChange('lastname', e)}
              />
              <TextField
                className={styles.TextField}
                defaultValue={this.state.firstname}
                label={this.isValid('firstname')
                  ? 'Prénom'
                  : 'Le prénom ne peut être vide, et ne peut contenir que des caractères alphanumériques et des espaces.'}
                error={!this.isValid('firstname')}
                onChange={(e) => this.onChange('firstname', e)}
              />
              <TextField
                className={styles.TextField}
                defaultValue={this.state.username}
                error={!this.isValid('username')}
                onChange={(e) => this.onChange('username', e)}
                onKeyUp={this.handleKeyUp}
                label={this.getUsernameLabel(
                  'Pseudo (affiché)',
                  'Pseudo déjà utilisé. Veuillez en choisir un autre.',
                  'Le pseudo ne doit pas contenir d\'espaces, et peut contenir les caractères spéciaux suivants: !?$#@()-*'
                )}
              />

              <div className={styles.buttons}>
                <Button label='Suivant' onClick={this.next} width={185} />
              </div>
            </React.Fragment>
          )}

          {this.currentStep === 1 && (
            <React.Fragment>
              <Avatar
                size={120}
                image={this.state.image}
                username={this.state.username}
                firstname={this.state.firstname}
                lastname={this.state.lastname}
              />
              <p className={styles.user}>{this.state.username}</p>
              <TextField
                className={styles.TextField}
                autoFocus
                type='password'
                label={this.isValid('password')
                  ? 'Mot de passe'
                  : 'Le mot de passe doit être composé d\'au moins 8 caractères, et contenir au moins un chiffre et un caractère spécial (!?$#@()-*)'}
                error={!this.isValid('password')}
                onChange={(e) => this.onChange('password', e)}
              />

              <TextField
                className={styles.TextField}
                type='password'
                label={this.isValid('passwordConfirmation')
                  ? 'Mot de passe (confirmation)'
                  : 'Les mots de passe ne correspondent pas.'}
                error={!this.isValid('passwordConfirmation')}
                onKeyUp={this.handleKeyUp}
                onChange={(e) => this.onChange('passwordConfirmation', e)}
              />

              <div className={styles.buttons}>
                <Button label='Précédent' onClick={this.previous} width={185} />
                <Button label='Terminer' onClick={this.finish} width={185} />
              </div>
            </React.Fragment>
          )}
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
