import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Button, Modal } from '../../components'

import styles from './ConfirmDialog.module.scss'

const ConfirmDialog = ({ title, text, onConfirm, onCancel, onClose }) => {
  const { t } = useTranslation()

  return (
    <Modal width={511} onClose={onClose}>
      <div className={styles.ConfirmDialog}>
        <span className={styles.title}>{title}</span>
        <p className='subtitle'>{text}</p>
        <div className={styles.buttons}>
          <Button onClick={onCancel}>{t('Cancel')}</Button>
          <Button onClick={onConfirm}>{t('Confirm')}</Button>
        </div>
      </div>
    </Modal>
  )
}

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ConfirmDialog
