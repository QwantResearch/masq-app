import React from 'react'
import PropTypes from 'prop-types'

import { useTranslation } from 'react-i18next'
import { Button, Modal, Typography, Space } from '../../components'
import styles from './PersistentStorageRequest.module.scss'

const PermanentStorageRequest = ({ onClose }) => {
  const { t } = useTranslation()
  return (
    <Modal title={t('Storage authorization')} onClose={onClose}>
      <div className={styles.PermanentStorage}>
        <div>
          <Space size={32} />
          <Typography type='paragraph-modal'>
            {`${t('In order to store your data securely,')}
          ${t('please authorize Masq to use the persistent storage of the browser.')}
          ${t('This notification will appear again if necessary.')}`}
          </Typography>
        </div>
        <Space size={32} />
        <Button onClick={onClose}>{t('Ok')}</Button>
      </div>
    </Modal>
  )
}

PermanentStorageRequest.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default PermanentStorageRequest
