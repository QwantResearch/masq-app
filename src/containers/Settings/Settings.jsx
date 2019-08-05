import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Trash } from 'react-feather'
import { withTranslation } from 'react-i18next'
import { updateUser, removeProfile, setNotification } from '../../actions'
import { Avatar, Button, TextField, Typography, Space } from '../../components'
import { DeleteProfileDialog, PasswordEdit } from '../../modals'
import { isName, isUsername } from '../../lib/validators'
import { isUsernameAlreadyTaken, compressImage, MAX_IMAGE_SIZE } from '../../lib/utils'

import styles from './Settings.module.scss'

class Settings extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      image: '',
      lastname: '',
      firstname: '',
      username: '',
      confirmDialog: false,
      passwordEditModal: false
    }

    this.hasChanged = false
    this.validate = this.validate.bind(this)
    this.isValid = this.isValid.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.confirmDelete = this.confirmDelete.bind(this)
    this.openConfirmDialog = this.openConfirmDialog.bind(this)
    this.closeConfirmDialog = this.closeConfirmDialog.bind(this)
    this.openPasswordEditModal = this.openPasswordEditModal.bind(this)
    this.closePasswordEditModal = this.closePasswordEditModal.bind(this)
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
      this.hasChanged = true
      this.setState({ image: reader.result })
    })

    reader.readAsDataURL(image)
  }

  validate () {
    const { t, setNotification } = this.props

    if (!this.hasChanged) {
      return
    }

    // Every fields should be valid
    const isValid = ['username', 'image', 'firstname', 'lastname'].every(key => {
      return this.isValid(key)
    })

    // If invalid, return
    if (!isValid) {
      // forceUpdate to show errors
      return this.forceUpdate()
    }

    this.props.updateUser(this.props.user.id, this.state)
    setNotification({ title: t('Your information has been updated successfully.') })
    this.hasChanged = false
  }

  handleKeyUp (e) {
    if (e.key === 'Enter') {
      this.validate()
    }
  }

  openConfirmDialog () {
    this.setState({
      confirmDialog: true
    })
  }

  async confirmDelete () {
    const { setNotification, t } = this.props
    await this.props.removeProfile()
    setNotification({
      title: t('Profile succesfully removed.')
    })
  }

  closeConfirmDialog () {
    this.setState({
      confirmDialog: false
    })
  }

  openPasswordEditModal () {
    this.setState({
      passwordEditModal: true
    })
  }

  closePasswordEditModal () {
    this.setState({
      passwordEditModal: false
    })
  }

  render () {
    const { user } = this.props
    const { confirmDialog, passwordEditModal } = this.state
    if (!this.props.user) return <Redirect to='/' />
    const { t } = this.props

    return (
      <div className={styles.Settings}>
        <div className={styles.page}>
          <div>
            <Typography type='title-page'>{t('My settings')}</Typography>
            <Space size={30} />
            <div className={styles.content}>
              <div className={styles.avatar}>
                <Avatar upload size={192} image={this.state.image} onChange={(e) => this.onImageChange(e)} username={user.username} />
              </div>

              <div className={styles.inputs}>
                <TextField
                  error={!this.isValid('username')}
                  onKeyUp={this.handleKeyUp}
                  defaultValue={this.state.username}
                  onChange={(e) => this.onChange('username', e)}
                  label={this.getUsernameLabel(
                    t('Username (displayed)'),
                    t('The specified username is already used'),
                    t('The username must not contain spaces, and can contain only the following special characters:!?$#@()-*')
                  )}
                />
                <TextField
                  error={!this.isValid('firstname')}
                  onKeyUp={this.handleKeyUp}
                  defaultValue={this.state.firstname}
                  onChange={(e) => this.onChange('firstname', e)}
                  label={this.isValid('firstname')
                    ? t('Firstname (optional)')
                    : t('The firstname can only contain alphanumeric characters and spaces')}
                />
                <TextField
                  error={!this.isValid('lastname')}
                  onKeyUp={this.handleKeyUp}
                  defaultValue={this.state.lastname}
                  onChange={(e) => this.onChange('lastname', e)}
                  label={this.isValid('lastname')
                    ? t('Lastname (optional)')
                    : t('The lastname can only contain alphanumeric characters and spaces')}
                />
                <TextField
                  type='password'
                  defaultValue='password'
                  label={t('Secret key')}
                  button={t('Update')}
                  onClick={this.openPasswordEditModal}
                />
              </div>
            </div>
          </div>

          <div className={styles.rightSection}>
            <Button width={193} secondary={!this.hasChanged} onClick={this.validate}>{t('Save')}</Button>
            <Space size={24} />
            <div className={styles.deleteButton} onClick={this.openConfirmDialog}>
              <Typography align='center' type='label' color={styles.colorBlueGrey}>
                <Trash className={styles.trashIcon} size={14} color={styles.colorBlueGrey} />
                {t('Delete the profile')}
              </Typography>
            </div>
          </div>
        </div>

        {passwordEditModal && (
          <PasswordEdit onClose={this.closePasswordEditModal} />
        )}

        {confirmDialog && (
          <DeleteProfileDialog
            username={this.props.user.username}
            onConfirm={() => this.confirmDelete()}
            onCancel={() => this.closeConfirmDialog()}
            onClose={() => this.closeConfirmDialog()}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.masq.currentUser
})

const mapDispatchToProps = dispatch => ({
  updateUser: (id, user) => dispatch(updateUser(id, user)),
  setNotification: (notif) => dispatch(setNotification(notif)),
  removeProfile: () => dispatch(removeProfile())
})

Settings.propTypes = {
  user: PropTypes.object,
  updateUser: PropTypes.func,
  removeProfile: PropTypes.func,
  setNotification: PropTypes.func,
  t: PropTypes.func
}
const translatedSettings = withTranslation()(Settings)
export default connect(mapStateToProps, mapDispatchToProps)(translatedSettings)
