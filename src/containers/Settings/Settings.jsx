import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Button, TextField } from 'qwant-research-components'

import { updateUser, setNotification } from '../../actions'
import { Avatar } from '../../components'
import { isName, isUsername } from '../../library/validators'
import { isUsernameAlreadyTaken, compressImage, MAX_IMAGE_SIZE } from '../../library/utils'

import styles from './Settings.module.scss'

class Settings extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      image: '',
      lastname: '',
      firstname: '',
      username: ''
    }

    this.hasChanged = false
    this.validate = this.validate.bind(this)
    this.isValid = this.isValid.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
  }

  componentDidMount () {
    const { user } = this.props
    if (!user) return

    this.setState({
      image: user.image,
      lastname: user.lastname,
      firstname: user.firstname,
      username: user.username
    })
  }

  isValid (fieldName) {
    const { id } = this.props.user
    const field = this.state[fieldName]
    switch (fieldName) {
      case 'lastname': return isName(field)
      case 'firstname': return isName(field)
      case 'username': return isUsername(field) && !isUsernameAlreadyTaken(field, id)
      case 'image': return true
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
    this.hasChanged = true
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
      this.hasChanged = true
      this.setState({ image: reader.result })
    })

    reader.readAsDataURL(image)
  }

  validate () {
    if (!this.hasChanged) {
      return
    }

    // Every fields should be valid
    const isValid = Object.keys(this.state).every(key => this.isValid(key))
    // If invalid, return
    if (!isValid) {
      // forceUpdate to show errors
      return this.forceUpdate()
    }

    this.props.updateUser(this.props.user.id, this.state)
    this.hasChanged = false
  }

  handleKeyUp (e) {
    if (e.key === 'Enter') {
      this.validate()
    }
  }

  render () {
    if (!this.props.user) return <Redirect to='/' />

    return (
      <div className={styles.Settings}>

        <div className={styles.main}>
          <p className='title'>Vos paramètres d'utilisateur</p>
          <p className='subtitle'>Changez vos informations personnelles</p>
          <div className={styles.avatar}>
            <Avatar upload size={192} image={this.state.image} onChange={(e) => this.onImageChange(e)} />
          </div>
        </div>

        <div className={styles.inputs}>
          <TextField
            error={!this.isValid('lastname')}
            onKeyUp={this.handleKeyUp}
            defaultValue={this.state.lastname}
            onChange={(e) => this.onChange('lastname', e)}
            label={this.isValid('lastname')
              ? 'Nom (facultatif)'
              : 'Le nom ne peut contenir que des caractères alphanumériques et des espaces.'}
          />
          <TextField
            error={!this.isValid('firstname')}
            onKeyUp={this.handleKeyUp}
            defaultValue={this.state.firstname}
            onChange={(e) => this.onChange('firstname', e)}
            label={this.isValid('firstname')
              ? 'Prénom (facultatif)'
              : 'Le prénom ne peut contenir que des caractères alphanumériques et des espaces.'}
          />
          <TextField
            error={!this.isValid('username')}
            onKeyUp={this.handleKeyUp}
            defaultValue={this.state.username}
            onChange={(e) => this.onChange('username', e)}
            label={this.getUsernameLabel(
              'Pseudo (affiché)',
              'Pseudo déjà utilisé. Veuillez en choisir un autre.',
              'Le pseudo ne doit pas contenir d\'espaces, et peut contenir les caractères spéciaux suivants: !?$#@()-*'
            )}
          />
        </div>

        <div className={styles.sidebar}>
          <Button width={200} secondary={!this.hasChanged} label='SAUVEGARDER' onClick={this.validate} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.masq.currentUser
})

const mapDispatchToProps = dispatch => ({
  updateUser: (id, user) => dispatch(updateUser(id, user)),
  setNotification: (notif) => dispatch(setNotification(notif))
})

Settings.propTypes = {
  user: PropTypes.object,
  updateUser: PropTypes.func,
  setNotification: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
