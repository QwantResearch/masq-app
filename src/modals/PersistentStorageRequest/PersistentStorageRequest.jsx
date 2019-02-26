import React from 'react'
import { Button } from 'qwant-research-components'
import PropTypes from 'prop-types'

import { Modal } from '../../components'

import styles from './PersistentStorageRequest.module.scss'

const PermanentStorageRequest = ({ onClose }) => (
  <Modal height={330} width={511} onClose={onClose}>
    <div className={styles.PermanentStorage}>
      <span className={styles.title}>Autorisation de stockage</span>
      <p className='subtitle'>Afin de stocker vos données de manière sécurisée,
        merci d'autoriser Masq à utiliser le stockage persistant de votre navigateur.
        Cette notification réapparaitra à la prochaine ouverture de Masq si nécessaire.
      </p>
      <Button label='OK' onClick={onClose} />
    </div>
  </Modal>
)

PermanentStorageRequest.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default PermanentStorageRequest
