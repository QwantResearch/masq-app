import React from 'react'
import PropTypes from 'prop-types'

import { Button, Modal, Typography, Space, Card } from '../../components'
import { useTranslation } from 'react-i18next'
import styles from './DeleteAppDialog.module.scss'

const ConfirmDialog = ({ app, onConfirm, onCancel, onClose }) => {
  const { t } = useTranslation()
  return (
    <Modal width={400} padding={40} onClose={onClose}>
      <div className={styles.ConfirmDialog}>
        <Typography type='title-modal'>{`${t('Deletion of the application')} ${app.appId}`}</Typography>
        <Space size={32} />
        <Typography type='paragraph-modal'>
          {`${t('You are at the point of deleting the application ')} "${app.appId}" ${t('from Masq with all the associated data.')}
        ${t(' All the data will be lost.')}`}
        </Typography>
        <Space size={36} />
        <Card
          title={app.name}
          image={app.imageURL}
          description={app.description}
        />
        <Space size={32} />
        <div className={styles.buttons}>
          <Button width={185} color='neutral' onClick={onCancel}>{t('Cancel')}</Button>
          <Button width={185} color='danger' onClick={onConfirm}>{t('Delete the application')}</Button>
        </div>
      </div>
    </Modal>
  )
}

ConfirmDialog.propTypes = {
  app: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ConfirmDialog
