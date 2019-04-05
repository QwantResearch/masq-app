import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import QRCode from 'qrcode.react'

import { Button, Modal, Typography } from '../../components'

import styles from './QRCodeModal.module.scss'

class QRCodeModal extends Component {
  copyLink () {
    const link = document.querySelector('input')
    link.select()
    document.execCommand('copy')
  }

  render () {
    const { onClose, currentAppRequest } = this.props

    return (
      <Modal width={511} onClose={onClose}>
        <div className={styles.QRCode}>
          <Typography type='title-modal'>Connexion avec un autre appareil</Typography>
          <Typography type='paragraph-modal'>Scannez le QRCode suivant sur votre téléphone, ou copiez le lien suivant sur un autre appareil pour vous connecter depuis celui-ci.</Typography>
          <QRCode value={currentAppRequest.link} style={{ marginBottom: 16 }} />
          <input id='link' readOnly defaultValue={currentAppRequest.link} />
          <Button onClick={this.copyLink}>Copier</Button>
        </div>
      </Modal>
    )
  }
}

QRCodeModal.propTypes = {
  onClose: PropTypes.func,
  currentAppRequest: PropTypes.object
}

const mapStateToProps = state => ({
  currentAppRequest: state.masq.currentAppRequest
})

export default connect(mapStateToProps)(QRCodeModal)
