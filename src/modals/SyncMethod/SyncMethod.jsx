import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Typography, Space } from '../../components'
import { HelpCircle } from 'react-feather'

import styles from './SyncMethod.module.scss'

const SyncMethod = ({ onOpenOnboardingCopyLink, onOpenOnboardingQrCode, onClose, onSync }) => {
  const { t } = useTranslation()

  return (
    <Modal width={400} padding={40} onClose={onClose}>
      <div className={styles.SyncMethod}>
        <Typography type='title-modal'>{t('Synchronization method')}</Typography>
        <div className={styles.content}>
          <Space size={5} />
          <p className={styles.text}>{t('Hold your device over the QR Code so that it\'s clearly visible within your smartphone\'s screen:')}</p>
          <Space size={30} />
          <Button width='100%'>{t('Scan the QR code')}</Button>
          <Space size={25} />
          <div onClick={onOpenOnboardingQrCode} className={styles.onBoardingMessage}>
            <HelpCircle size={14} color='#353c52' />
            <Space size={5} direction='left' />
            <Typography color={styles.colorBlueGrey} type='label'>{t('How to display the QR code?')}</Typography>
          </div>
          <Space size={59} />
          <div className={styles.separation}>
            <div className={styles.divider} />
            <Space size={5} direction='left' />
            <Typography color={styles.colorBlueGrey} type='subtitle-page'>{t('or')}</Typography>
            <Space size={5} direction='left' />
            <div className={styles.divider} />
          </div>
          <Space size={59} />
          <p className={styles.text}>{t('Copy the link displayed on your original device and paste it into this mobile:')}</p>
          <Space size={30} />
          <Button width='100%' onClick={onSync}>{t('Paste the profile link')}</Button>
          <Space size={25} />
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
  onOpenOnboardingCopyLink: PropTypes.func,
  onOpenOnboardingQrCode: PropTypes.func
}

export default SyncMethod
