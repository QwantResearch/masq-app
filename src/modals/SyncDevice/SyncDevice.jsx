import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { RefreshCw, CheckCircle, XCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'

import { Modal, Button, Space, Typography } from '../../components'

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

const SyncDeviceModalSyncing = ({ t, setSyncStep }) => (
  <SyncDeviceModal>
    <Typography type='title-modal'>{t('Synchronization in progress...')}</Typography>
    <Space size={80} />
    <RefreshCw className={styles.refeshIcon} size={124} color={styles.colorCyan} />
    <Space size={32} />
    <Typography maxWidth={280} align='center' type='paragraph-modal'>{t('Please wait, we are retrieving your profile')}</Typography>
    <Space size={79} />
    <Button color='neutral' onClick={() => setSyncStep(1)}>{t('cancel')}</Button>
    <Space size={32} />
  </SyncDeviceModal>
)

const SyncDeviceModalFinished = ({ t, setSyncStep }) => (
  <SyncDeviceModal>
    <Typography type='title-modal'>{t('Synchronization finished!')}</Typography>
    <Space size={80} />
    <CheckCircle size={124} color={styles.colorGreen} />
    <Space size={32} />
    <Typography maxWidth={280} align='center' type='paragraph-modal'>{t('You can now use your profile on your new device!')}</Typography>
    <Space size={60} />
    <Button color='neutral' onClick={() => setSyncStep(2)}>{t('close')}</Button>
    <Space size={32} />
  </SyncDeviceModal>
)

const SyncDeviceModalError = ({ t, setSyncStep }) => (
  <SyncDeviceModal>
    <Typography type='title-modal'>{t('Synchronization failure')}</Typography>
    <Space size={80} />
    <XCircle size={124} color={styles.colorRed} />
    <Space size={32} />
    <Typography maxWidth={280} align='center' type='paragraph-modal'>{t('We were unable to retrieve your profile, please try again.')}</Typography>
    <Space size={60} />
    <Button color='neutral' onClick={() => setSyncStep(0)}>{t('go back')}</Button>
    <Space size={32} />
  </SyncDeviceModal>
)

const SyncDevice = () => {
  const [syncStep, setSyncStep] = useState(0)
  const { t } = useTranslation()

  switch (syncStep) {
    case 0:
      return <SyncDeviceModalSyncing t={t} setSyncStep={setSyncStep} />
    case 1:
      return <SyncDeviceModalFinished t={t} setSyncStep={setSyncStep} />
    default:
      return <SyncDeviceModalError t={t} setSyncStep={setSyncStep} />
  }
}

SyncDeviceModalSyncing.propTypes =
SyncDeviceModalFinished.propTypes =
SyncDeviceModalError.propTypes = {
  t: PropTypes.func,
  setSyncStep: PropTypes.func
}

SyncDeviceModal.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
}

export default SyncDevice
