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
    this.handleValidate = this.handleValidate.bind(this)
    this.isValid = this.isValid.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.confirmDelete = this.confirmDelete.bind(this)
    this.handleOpenConfirmDialog = this.handleOpenConfirmDialog.bind(this)
    this.closeConfirmDialog = this.closeConfirmDialog.bind(this)
    this.handleOpenPasswordEditModal = this.handleOpenPasswordEditModal.bind(this)
    this.handleClosePasswordEditModal = this.handleClosePasswordEditModal.bind(this)
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
    const username = this.state.username

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

  handleValidate (e) {
    e.preventDefault()
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
      this.handleValidate()
    }
  }

  handleOpenConfirmDialog () {
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

  handleOpenPasswordEditModal () {
    this.setState({
      passwordEditModal: true
    })
  }

  handleClosePasswordEditModal () {
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
        <Typography type='title-page'>{t('My settings')}</Typography>
        <div className={styles.page}>
          <div>
            <Space size={30} />
            <div className={styles.content}>
              <div className={styles.avatar}>
                <Avatar upload size={192} image={this.state.image} onChange={(e) => this.onImageChange(e)} username={user.username} />
              </div>
              <form className={styles.inputs} onSubmit={this.handleValidate}>
                <TextField
                  autoComplete='username'
                  error={!this.isValid('username')}
                  defaultValue={this.state.username}
                  onChange={(e) => this.onChange('username', e)}
                  label={this.getUsernameLabel(
                    t('Username (displayed)'),
                    t('The specified username is already used'),
                    t('The username must not contain spaces, and can contain only the following special characters:!?$#@()-*')
                  )}
                />
                <TextField
                  autoComplete='firstname'
                  error={!this.isValid('firstname')}
                  defaultValue={this.state.firstname}
                  onChange={(e) => this.onChange('firstname', e)}
                  label={this.isValid('firstname')
                    ? t('Firstname (optional)')
                    : t('The firstname can only contain alphanumeric characters and spaces')}
                />
                <TextField
                  autoComplete='lastname'
                  error={!this.isValid('lastname')}
                  defaultValue={this.state.lastname}
                  onChange={(e) => this.onChange('lastname', e)}
                  label={this.isValid('lastname')
                    ? t('Lastname (optional)')
                    : t('The lastname can only contain alphanumeric characters and spaces')}
                />
                <TextField
                  autoComplete='current-password'
                  type='password'
                  defaultValue='password'
                  label={t('Secret key')}
                  button={t('Update')}
                  onClick={this.handleOpenPasswordEditModal}
                />
              </form>
            </div>
          </div>

          <div className={styles.rightSection}>
            <Button width={193} secondary={!this.hasChanged} onClick={this.handleValidate}>{t('Save')}</Button>
            <Space size={24} />
            <div className={styles.deleteButton} onClick={this.handleOpenConfirmDialog}>
              <Typography align='center' type='label' color={styles.colorBlueGrey}>
                <Trash className={styles.trashIcon} size={14} color={styles.colorBlueGrey} />
                {t('Delete the profile')}
              </Typography>
            </div>
          </div>
        </div>

        {passwordEditModal && (
          <PasswordEdit onClose={this.handleClosePasswordEditModal} />
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
