import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Button, Modal, Space } from '../../components'

import styles from './AddProfile.module.scss'

const AddProfile = ({ onSync, onClose, onSignup }) => {
  const { t } = useTranslation()

  return (
    <Modal title={t('Add a new profile')} mobileHeader width={400} padding={40} onClose={onClose}>
      <div className={styles.AddProfile}>
        <div className={styles.content}>
          <Space size={32} />
          <Button width='100%' color='success' onClick={onSignup}>{t('Create a new profile')}</Button>
          <Space size={16} />
          <p className={styles.text}>{t('or')}</p>
          <Space size={16} />
          <Button width='100%' onClick={onSync}>{t('Sync an existing profile')}</Button>
        </div>
      </div>
    </Modal>
  )
}

AddProfile.propTypes = {
  onClose: PropTypes.func,
  onSignup: PropTypes.func,
  onSync: PropTypes.func
}

export default AddProfile
