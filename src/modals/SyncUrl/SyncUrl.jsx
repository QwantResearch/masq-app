import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Typography, Space, TextField } from '../../components'

import styles from './SyncUrl.module.scss'

const SyncUrl = ({ onClose, onSync }) => {
  const { t } = useTranslation()
  const [url, setUrl] = useState('')

  return (
    <Modal width={400} padding={40} onClose={onClose}>
      <div className={styles.SyncUrl}>
        <Typography type='title-modal'>{t('Synchronize a profile')}</Typography>
        <div className={styles.content}>
          <Space size={32} />
          <p className={styles.text}>
            {t('Copy the link displayed on your initial device, then paste it in the field "link to existing profile" on this device.')}
          </p>
          <Space size={32} />
          <TextField
            className={styles.textField}
            label={t('Link to existing profile')}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Space size={32} />
          <div className={styles.buttons}>
            <Button color='neutral' width={185} onClick={onClose}>{t('Cancel')}</Button>
            <Button width={185} onClick={() => onSync(url)}>{t('Synchronize')}</Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

SyncUrl.propTypes = {
  onClose: PropTypes.func,
  onSync: PropTypes.func.isRequired
}

export default SyncUrl
