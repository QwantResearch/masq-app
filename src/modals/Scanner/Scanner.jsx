import React, { Component } from 'react'
import PropTypes from 'prop-types'
import QrReader from 'react-qr-reader'
import { withTranslation } from 'react-i18next'

import { Modal, Typography, Space, Button } from '../../components'

import styles from './Scanner.module.scss'

class Scanner extends Component {
  constructor (props) {
    super(props)
    this.handleError = this.handleError.bind(this)
  }

  handleScan (url) {
    if (url) {
      window.location.replace(url)
    }
  }

  handleError (e) {
    console.error(e)
    this.props.onClose()
  }

  render () {
    const { t, onClose } = this.props
    return (
      <Modal title={t('Scan QR code')} onClose={onClose} padding={0} width={350}>
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
        <Space size={32} />
        <Button className={styles.button} color='neutral' width={185} onClick={onClose}>{t('go back')}</Button>
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
