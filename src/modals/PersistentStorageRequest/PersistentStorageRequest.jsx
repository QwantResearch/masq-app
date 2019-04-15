import React from 'react'
import PropTypes from 'prop-types'

import { Button, Modal, Typography, Space } from '../../components'

import styles from './PersistentStorageRequest.module.scss'

const PermanentStorageRequest = ({ onClose }) => (
  <Modal width={511} onClose={onClose}>
    <div className={styles.PermanentStorage}>
      <div>
        <Typography type='title-modal'>Autorisation de stockage</Typography>
        <Space size={32} />
        <Typography type='paragraph-modal'>
          Afin de stocker vos données de manière sécurisée,
          merci d'autoriser Masq à utiliser le stockage persistant de votre navigateur.
          Cette notification réapparaîtra à la prochaine ouverture de Masq si nécessaire.
        </Typography>
      </div>
      <Space size={32} />
      <Button width={80} onClick={onClose}>Ok</Button>
    </div>
  </Modal>
)

PermanentStorageRequest.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default PermanentStorageRequest
