import React from 'react'
import PropTypes from 'prop-types'
import { Button } from 'qwant-research-components'

import { Modal } from '../../components'

import styles from './AddProfile.module.scss'

const AddProfile = ({ onClose, onNewProfile, onSyncProfile }) => (
  <Modal height={370} width={511} onClose={onClose}>
    <div className={styles.AddProfile}>
      <Button label='Nouveau profil' onClick={onNewProfile} />
      <Button label='Synchroniser un profil existant' onClick={onSyncProfile} />
    </div>
  </Modal>
)

AddProfile.propTypes = {
  onClose: PropTypes.func.isRequired,
  onNewProfile: PropTypes.func,
  onSyncProfile: PropTypes.func
}

export default AddProfile
