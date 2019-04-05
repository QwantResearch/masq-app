import React from 'react'
import PropTypes from 'prop-types'
import { AlertCircle } from 'react-feather'

import { Button, Modal, Typography, Space } from '../../components'

import styles from './DeleteProfileDialog.module.scss'

const ConfirmDialog = ({ username, onConfirm, onCancel, onClose }) => (
  <Modal width={465} onClose={onClose}>
    <div className={styles.ConfirmDialog}>
      <Typography type='title-modal'>Suppression de compte</Typography>
      <Space size={32} />
      <AlertCircle size={104} color='#ff3b4a' />
      <Space size={32} />
      <Typography type='paragraph-modal'>
        Vous êtes sur le point de supprimer le compte « {username} »
        Toutes les données personnelles de toutes les applications ajoutées dans Masq seront perdues.
      </Typography>
      <Space size={16} />
      <Typography type='paragraph-modal'>
        Voulez-vous vraiment continuer ?
      </Typography>
      <Space size={32} />
      <div className={styles.buttons}>
        <Button width={185} color='neutral' onClick={onCancel}>Annuler</Button>
        <Button width={185} color='danger' onClick={onConfirm}>Supprimer ce compte</Button>
      </div>
    </div>
  </Modal>
)

ConfirmDialog.propTypes = {
  username: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ConfirmDialog
