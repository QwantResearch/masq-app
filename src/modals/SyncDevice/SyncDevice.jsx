import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { RefreshCw, CheckCircle, XCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'

import { Modal, Button, Space, Typography, Avatar, TextField } from '../../components'

import styles from './SyncDevice.module.scss'

const SyncDeviceModal = ({ children }) => {
  return (
    <Modal width={400}>
      <div className={styles.SyncDevice}>
        {children}
      </div>
    </Modal>
  )
}

const SyncDeviceModalSyncing = ({ t, onClick, message }) => (
  <SyncDeviceModal>
    <Typography type='title-modal'>{t('Synchronization in progress...')}</Typography>
    <Space size={80} />
    <RefreshCw className={styles.refeshIcon} size={124} color={styles.colorCyan} />
    <Space size={32} />
    <Typography maxWidth={280} align='center' type='paragraph-modal'>
      {message || t('Please wait, we are retrieving your profile')}
    </Typography>
    <Space size={79} />
    <Button color='neutral' onClick={onClick}>{t('cancel')}</Button>
    <Space size={32} />
  </SyncDeviceModal>
)

const SyncDeviceModalPassword = ({ t, onClose, onClick, avatar, username, error, onKeyUp }) => {
  const [password, setPassword] = useState('')
  const handlePassword = (e) => {
    setPassword(e.target.value)
  }

  // TODO: handle enter key

  return (
    <SyncDeviceModal>
      <Typography type='title-modal'>{t('Saisir votre clé secrète pour finaliser la synchronisation')}</Typography>
      <Space size={32} />
      <Avatar size={90} username={username} image={avatar} />
      <Space size={12} />
      <Typography type='username' color='#353c52'>{username}</Typography>
      <Space size={32} />
      <TextField
        error={error}
        label={error ? t('Wrong password, please try again') : ''}
        className={styles.textField}
        height={46}
        password
        type='password'
        defaultValue={password}
        onChange={handlePassword}
        onKeyUp={onKeyUp}
      />
      <Space size={48} />
      <div className={styles.buttons}>
        <Button width='185px' color='neutral' onClick={onClose}>{t('cancel')}</Button>
        <Button width='185px' onClick={() => onClick(password)}>{t('Finish')}</Button>
      </div>
    </SyncDeviceModal>
  )
}

const SyncDeviceModalFinished = ({ t, onClick, message }) => (
  <SyncDeviceModal>
    <Typography type='title-modal'>{t('Synchronization finished!')}</Typography>
    <Space size={80} />
    <CheckCircle size={124} color={styles.colorGreen} />
    <Space size={32} />
    <Typography maxWidth={280} align='center' type='paragraph-modal'>
      {message || t('You can now use your profile on your new device!')}
    </Typography>
    <Space size={60} />
    <Button color='neutral' onClick={onClick}>{t('close')}</Button>
    <Space size={32} />
  </SyncDeviceModal>
)

const SyncDeviceModalError = ({ t, onClick, message }) => (
  <SyncDeviceModal>
    <Typography type='title-modal'>{t('Synchronization failure')}</Typography>
    <Space size={80} />
    <XCircle size={124} color={styles.colorRed} />
    <Space size={32} />
    <Typography maxWidth={280} align='center' type='paragraph-modal'>
      {message || t('We were unable to retrieve your profile, please try again.')}
    </Typography>
    <Space size={60} />
    <Button color='neutral' onClick={onClick}>{t('go back')}</Button>
    <Space size={32} />
  </SyncDeviceModal>
)

const SyncDevice = ({ step, onClick, onClose, message, profile, error, onKeyUp }) => {
  const { t } = useTranslation()

  switch (step) {
    case 'syncing':
      return <SyncDeviceModalSyncing t={t} onClick={onClick} message={message} />
    case 'password':
      return <SyncDeviceModalPassword t={t} error={error} onClose={onClose} message={message} avatar={profile.image} username={profile.username} onClick={onClick} onKeyUp={onKeyUp} />
    case 'finished':
      return <SyncDeviceModalFinished t={t} onClick={onClick} message={message} />
    default:
      return <SyncDeviceModalError t={t} onClick={onClick} message={message} />
  }
}

SyncDeviceModalSyncing.propTypes =
SyncDeviceModalFinished.propTypes =
SyncDeviceModalError.propTypes = {
  t: PropTypes.func,
  onClick: PropTypes.func,
  message: PropTypes.string
}

SyncDeviceModalPassword.propTypes = {
  t: PropTypes.func,
  onClick: PropTypes.func,
  avatar: PropTypes.string,
  username: PropTypes.string,
  onClose: PropTypes.func,
  error: PropTypes.bool,
  onKeyUp: PropTypes.func
}

SyncDeviceModal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
}

SyncDevice.propTypes = {
  step: PropTypes.oneOf(['syncing', 'password', 'finished', 'error']).isRequired,
  message: PropTypes.string,
  onClick: PropTypes.func,
  onClose: PropTypes.func,
  profile: PropTypes.object,
  error: PropTypes.bool,
  onKeyUp: PropTypes.func
}

export default SyncDevice
