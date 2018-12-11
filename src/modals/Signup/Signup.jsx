import React from 'react'
import PropTypes from 'prop-types'
import { Button, TextField } from 'qwant-research-components'

import { Avatar, Modal } from '../../components'

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
    if (!this.validationEnabled) {
      // Don't show error as long as the user does not click Finish btn
      return true
    }

    if (fieldName === 'image') return true
    if (fieldName === 'password') {
      return this.state[fieldName].length >= 8
    }
    if (fieldName === 'passwordConfirmation') {
      return this.state[fieldName] === this.state.password
    }

    return this.state[fieldName].length > 0
  }

  onChange (field, event) {
    const value = event.target.value.trim()
    this.setState({
      [field]: value
    })
  }

  onImageChange (event) {
    const reader = new window.FileReader()
    const file = event.target.files[0]
    if (!file) {
      return
    }

    reader.addEventListener('load', () => {
      this.setState({ image: reader.result })
    })
    reader.readAsDataURL(file)
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

    if (!this.isValid('password')) {
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
                label='Nom'
                error={!this.isValid('lastname')}
                onChange={(e) => this.onChange('lastname', e)}
              />
              <TextField
                className={styles.TextField}
                defaultValue={this.state.firstname}
                label='Prénom'
                error={!this.isValid('firstname')}
                onChange={(e) => this.onChange('firstname', e)}
              />
              <TextField
                className={styles.TextField}
                defaultValue={this.state.username}
                label='Pseudo (affiché)'
                error={!this.isValid('username')}
                onChange={(e) => this.onChange('username', e)}
                onKeyUp={this.handleKeyUp}
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
                  : 'Le mot de passe doit être composé d\'au moins 8 caractères.'}
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
  onClose: PropTypes.func
}

export default Signup
