import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Frown } from 'react-feather'
import { Modal, Typography, Space } from '../../components'

import styles from './UnavailableStorage.module.scss'

const UnavailableStorage = ({ onClose }) => {
  const { t } = useTranslation()

  return (
    <Modal width={511} onClose={onClose}>
      <div className={styles.UnsupportedBrowser}>
        <Typography type='title-modal'>{t('Masq can\'t create a profile in this browser')}</Typography>
        <Space size={16} />
        <Frown size={96} color={styles.colorRed} />
        <Space size={16} />
        <Typography type='paragraph-modal'>{t('Chances are that you are currrently browsing in a private window.')}</Typography>
        <Typography type='paragraph-modal'>{t('Please, try to open a normal window by selecting "new window" in your browser\'s menu and retry to create a Masq profile.')}</Typography>
      </div>
    </Modal>
  )
}

UnavailableStorage.propTypes = {
  onClose: PropTypes.func
}

export default UnavailableStorage
