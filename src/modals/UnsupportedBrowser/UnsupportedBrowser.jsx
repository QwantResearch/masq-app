import React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Typography, Space } from '../../components'
import { SUPPORTED_BROWSERS } from '../../lib/browser'
import { capitalize } from '../../lib/utils'
import { AlertOctagon } from 'react-feather'

import styles from './UnsupportedBrowser.module.scss'

const UnsupportedBrowser = () => {
  const { t } = useTranslation()

  return (
    <Modal width={511}>
      <div className={styles.UnsupportedBrowser}>
        <Typography type='title-modal'>{t('Browser not supported')}</Typography>
        <Space size={16} />
        <AlertOctagon size={114} color={styles.colorRed} />
        <Space size={16} />
        <Typography type='paragraph-modal'>{t('Your browser is not compatible with Masq. Please, try Masq with one of the compatible browsers:')}</Typography>
        <Space size={16} />
        {SUPPORTED_BROWSERS.map((browser, index) => (
          <Typography key={index} type='paragraph-modal' className={styles.fontMedium}>- {capitalize(browser)}</Typography>
        ))}
      </div>
    </Modal>
  )
}

export default UnsupportedBrowser
