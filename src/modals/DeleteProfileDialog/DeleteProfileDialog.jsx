import React from 'react'
import PropTypes from 'prop-types'
import { AlertCircle } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Typography, Space } from '../../components'

import styles from './DeleteProfileDialog.module.scss'

const ConfirmDialog = ({ username, onConfirm, onCancel, onClose }) => {
  const { t } = useTranslation()
  return (
    <Modal title={t('Deletion of the profile')} mobileHeader onClose={onClose}>
      <div className={styles.ConfirmDialog}>
        <Space size={32} />
        <AlertCircle size={104} color='#ff3b4a' />
        <Space size={32} />
        <Typography type='paragraph-modal'>
          {`${t('You are at the point of deleting the profile ')} « ${username} ».
        ${t(' All your personal data of Masq will be lost.')}`}
        </Typography>
        <Space size={32} />
        <div className={styles.buttons}>
          <Button width={185} color='neutral' onClick={onCancel}>{t('Cancel')}</Button>
          <Button width={185} color='danger' onClick={onConfirm}>{t('Delete the profile')}</Button>
        </div>
      </div>
    </Modal>
  )
}

ConfirmDialog.propTypes = {
  username: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ConfirmDialog
