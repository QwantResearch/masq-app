import React from 'react'
import PropTypes from 'prop-types'

import { Button, Modal } from '../../components'

import styles from './ConfirmDialog.module.scss'

const ConfirmDialog = ({ title, text, onConfirm, onCancel, onClose }) => (
  <Modal width={511} onClose={onClose}>
    <div className={styles.ConfirmDialog}>
      <span className={styles.title}>{title}</span>
      <p className='subtitle'>{text}</p>
      <div className={styles.buttons}>
        <Button onClick={onCancel}>Annuler</Button>
        <Button onClick={onConfirm}>Confirmer</Button>
      </div>
    </div>
  </Modal>
)

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ConfirmDialog
