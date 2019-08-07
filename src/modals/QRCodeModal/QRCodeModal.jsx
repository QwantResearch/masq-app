import React, { useState } from 'react'
import PropTypes from 'prop-types'
import QRCode from 'qrcode.react'
import { Copy } from 'react-feather'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'

import { Modal, Typography, Space, TextField } from '../../components'

import styles from './QRCodeModal.module.scss'

const Pill = ({ children }) => (
  <div className={styles.pill}>{children}</div>
)

Pill.propTypes = {
  children: PropTypes.string.isRequired
}

const QRCodeModal = ({ onClose, link }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    const link = document.querySelector('input')
    link.select()
    document.execCommand('copy')
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <Modal width={300} padding={78} onClose={onClose}>
      <div className={styles.QRCode}>
        <Typography type='title-modal'>{t('Add a device')}</Typography>
        <Space size={32} />
        <Typography maxWidth={320} type='paragraph-modal' align='center'>{t('Scan this QR Code with the device you want to synchronize:')}</Typography>
        <Space size={18} />
        <QRCode value={link} />
        <Space size={26} />
        <Typography line align='center' type='paragraph-modal' color={styles.colorBlueGrey}>{t('or')}</Typography>
        <Space size={22} />
        <Typography maxWidth={320} type='paragraph-modal' align='center'>{t('Copy the following link and paste it in the browser you want to use:')}</Typography>
        <Space size={24} />
        <TextField
          className={classNames(
            styles.input,
            { [styles.copied]: copied }
          )}
          readonly
          id='link'
          defaultValue={link}
          button={<Copy style={{ height: 40 }} />}
          height={36}
          onClick={() => copyLink()}
        />
        <Space size={8} />
        {copied && <Pill>{t('Link Copied !')}</Pill>}
        {!copied && <Space size={28} />}
        <Space size={16} />
      </div>
    </Modal>
  )
}

QRCodeModal.propTypes = {
  onClose: PropTypes.func,
  link: PropTypes.string
}

export default QRCodeModal
