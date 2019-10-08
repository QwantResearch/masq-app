import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Typography, Space } from '../../components'
import { HelpCircle } from 'react-feather'

import styles from './SyncMethod.module.scss'

const SyncMethod = ({ onOpenOnboardingCopyLink, onOpenOnboardingQrCode, onClose, onBack, onSync, onScanner }) => {
  const { t } = useTranslation()
  const message = t(`Hold your device over the QR Code so that it is clearly visible within your smartphone's screen:`) //eslint-disable-line
  return (
    <Modal title={t('Synchronization method')} onBack={onBack} mobileHeader width={400} height={600} padding={40} onClose={onClose}>
      <div className={styles.SyncMethod}>
        <div className={styles.content}>
          <p className={styles.text}>{message}</p>
          <Button width='90%' onClick={onScanner}>{t('Scan the QR code')}</Button>
          <div onClick={onOpenOnboardingQrCode} className={styles.onBoardingMessage}>
            <HelpCircle size={14} color='#353c52' />
            <Space size={5} direction='left' />
            <Typography color={styles.colorBlueGrey} type='label'>{t('How to display the QR code?')}</Typography>
          </div>
          <div className={styles.separation}>
            <div className={styles.divider} />
            <Space size={5} direction='left' />
            <Typography color={styles.colorBlueGrey} type='subtitle-page'>{t('or')}</Typography>
            <Space size={5} direction='left' />
            <div className={styles.divider} />
          </div>
          <p className={styles.text}>{t('Copy the link displayed on your original device and paste it into this mobile:')}</p>
          <Button width='90%' onClick={onSync}>{t('Paste the profile link')}</Button>
          <div onClick={onOpenOnboardingCopyLink} className={styles.onBoardingMessage}>
            <HelpCircle size={14} color='#353c52' />
            <Space size={5} direction='left' />
            <Typography color={styles.colorBlueGrey} type='label'>{t('How to find the profile link?')}</Typography>
          </div>
        </div>
      </div>
    </Modal>
  )
}

SyncMethod.propTypes = {
  onClose: PropTypes.func,
  onSync: PropTypes.func,
  onScanner: PropTypes.func,
  onOpenOnboardingCopyLink: PropTypes.func,
  onOpenOnboardingQrCode: PropTypes.func,
  onBack: PropTypes.func
}

export default SyncMethod
