import React from 'react'
import PropTypes from 'prop-types'

import { Button, Modal, Typography, Space, Card } from '../../components'

import styles from './DeleteAppDialog.module.scss'

const ConfirmDialog = ({ app, onConfirm, onCancel, onClose }) => (
  <Modal width={465} onClose={onClose}>
    <div className={styles.ConfirmDialog}>
      <Typography type='title-modal'>Suppression de l'application {app.appId}</Typography>
      <Space size={32} />
      <Typography type='paragraph-modal'>
        Vous êtes sur le point de supprimer l’application {app.appId} de Masq avec les données personnelles qui s’y rattachent.
        Ces données seront définitivement perdues.
      </Typography>
      <Space size={36} />
      <Card
        width={378}
        title={app.name}
        image={app.imageURL}
        description={app.description} />
      <Space size={32} />
      <div className={styles.buttons}>
        <Button width={185} color='neutral' onClick={onCancel}>Annuler</Button>
        <Button width={185} color='danger' onClick={onConfirm}>Supprimer l'application</Button>
      </div>
    </div>
  </Modal>
)

ConfirmDialog.propTypes = {
  app: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ConfirmDialog
