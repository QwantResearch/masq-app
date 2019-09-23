import React, { Component } from 'react'
import PropTypes from 'prop-types'
import QrReader from 'react-qr-reader'

import { Modal, Typography, Space } from '../../components'

import styles from './Scanner.module.scss'

class Scanner extends Component {
  render () {
    return (
      <Modal onClose={this.props.onClose} padding={0} width={350}>
        <Typography type='title-modal'>Scan QR code</Typography>
        <Space size={32} />
        <div style={{ marginLeft: 16, marginRight: 16 }}>
          <Typography type='paragraph-modal' align='center'>Placez ce téléphone face à votre appareil initial pour scanner le QR code</Typography>
        </div>
        <Space size={32} />
        <div className={styles.Scanner}>
          <QrReader
            className={styles.reader}
            delay={300}
            onError={this.handleError}
            onScan={this.handleScan}
          />
        </div>
      </Modal>
    )
  }
}

Scanner.propTypes = {
  onClose: PropTypes.func.isRequired
}

export default Scanner
