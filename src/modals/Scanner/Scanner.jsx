import React, { Component } from 'react'
import PropTypes from 'prop-types'
import QrReader from 'react-qr-reader'
import { withTranslation, useTranslation } from 'react-i18next'
import { XCircle } from 'react-feather'

import { Modal, Typography, Space, Button } from '../../components'

import styles from './Scanner.module.scss'

const ScannerError = ({ onClose }) => {
  const { t } = useTranslation()

  return (
    <Modal title={t('Scanner failure')} mobileHeader onClose={onClose}>
      <div className={styles.ScannerContainer}>
        <Space size={80} />
        <XCircle size={124} color={styles.colorRed} />
        <Space size={32} />
        <Typography maxWidth={280} align='center' type='paragraph-modal'>
          {t('To scan the QR code, you must allow this browser to access your camera. You can do this through your mobile settings. Warning: on iOS this is only possible with Safari.')}
        </Typography>
        <Button className={styles.button} color='neutral' onClick={onClose}>{t('go back')}</Button>
      </div>
    </Modal>
  )
}

ScannerError.propTypes = {
  onClose: PropTypes.func
}

class Scanner extends Component {
  constructor (props) {
    super(props)
    this.state = { error: false }
    this.handleError = this.handleError.bind(this)
  }

  handleScan (url) {
    if (url) {
      window.location.replace(url)
    }
  }

  handleError (e) {
    console.error(e)
    this.setState({ error: true })
  }

  render () {
    const { t, onClose } = this.props
    const { error } = this.state

    if (error) return <ScannerError onClose={onClose} />

    return (
      <Modal title={t('Scan QR code')} mobileHeader onClose={onClose}>
        <div className={styles.ScannerContainer}>
          <Space size={32} />
          <div style={{ marginLeft: 16, marginRight: 16 }}>
            <Typography type='paragraph-modal' align='center'>{t('Position this phone in front of your initial device to scan the QR code')}</Typography>
          </div>
          <Space size={32} />
          <div className={styles.Scanner}>
            <div className={styles.crossHairTop} />
            <div className={styles.crossHairRight} />
            <div className={styles.crossHairBottom} />
            <div className={styles.crossHairLeft} />
            <QrReader
              className={styles.reader}
              delay={300}
              onError={this.handleError}
              onScan={this.handleScan}
            />
          </div>
          <Button className={styles.button} color='neutral' width={185} onClick={onClose}>{t('go back')}</Button>
        </div>
      </Modal>
    )
  }
}

Scanner.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

const translatedScanner = withTranslation()(Scanner)
export default translatedScanner
