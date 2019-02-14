import React from 'react'
import PropTypes from 'prop-types'

import { Modal } from '../../components'

import styles from './PermanentStorageRequest.module.scss'

const PermanentStorageRequest = ({ onClose }) => (
  <Modal onClose={onClose} height={250} width={511}>
    <div className={styles.PermanentStorage}>
      <span className={styles.title}>Autorisation de stockage</span>
      <p className='subtitle'>Afin de stocker vos données de manière sécurisée,
        merci d'autoriser Masq à utiliser le stockage persistant de votre navigateur.
      </p>
    </div>
  </Modal>
)

PermanentStorageRequest.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default PermanentStorageRequest
