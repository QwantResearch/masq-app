import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Button, TextField } from 'qwant-research-components'

import { updateUser } from '../../actions'
import { Avatar } from '../../components'
import { isName, isUsername } from '../../library/validators'

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
    const field = this.state[fieldName]
    switch (fieldName) {
      case 'lastname': return isName(field)
      case 'firstname': return isName(field)
      case 'image': return true
      case 'username': return isUsername(field)
      default: return false
    }
  }

  onChange (field, event) {
    const value = event.target.value.trim()
    this.hasChanged = true
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
      this.hasChanged = true
      this.setState({ image: reader.result })
    })
    reader.readAsDataURL(file)
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
        <div>
          <div className={styles.titleContainer}>
            <p className='title'>Vos paramètres d'utilisateur</p>
            <p className='subtitle'>Changez vos informations personnelles</p>
          </div>

          <div className={styles.profile}>
            <Avatar upload size={192} image={this.state.image} onChange={(e) => this.onImageChange(e)} />
            <div className={styles.inputs}>
              <TextField
                error={!this.isValid('lastname')}
                onKeyUp={this.handleKeyUp}
                defaultValue={this.state.lastname} onChange={(e) => this.onChange('lastname', e)}
                label={this.isValid('lastname')
                  ? 'Nom'
                  : 'Le nom ne peut être vide, et ne peut contenir que des caractères alphanumériques et des espaces.'}
              />
              <TextField
                error={!this.isValid('firstname')}
                onKeyUp={this.handleKeyUp}
                defaultValue={this.state.firstname} onChange={(e) => this.onChange('firstname', e)}
                label={this.isValid('firstname')
                  ? 'Prénom'
                  : 'Le prénom ne peut être vide, et ne peut contenir que des caractères alphanumériques et des espaces.'}
              />
              <TextField
                error={!this.isValid('username')}
                onKeyUp={this.handleKeyUp}
                defaultValue={this.state.username} onChange={(e) => this.onChange('username', e)}
                label={this.isValid('username')
                  ? 'Pseudo (affiché)'
                  : 'Le pseudo ne doit pas contenir d\'espaces, et peut contenir les caractères spéciaux suivants: !?$#@()-*'}
              />
            </div>
          </div>
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
  updateUser: (id, user) => dispatch(updateUser(id, user))
})

Settings.propTypes = {
  user: PropTypes.object,
  updateUser: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
