import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button } from 'qwant-research-components'
import QRCode from 'qrcode.react'

import { Modal } from '../../components'

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
      <Modal height={540} width={511} onClose={onClose}>
        <div className={styles.QRCode}>
          <p className={styles.title}>Connexion avec un autre appareil</p>
          <p className={styles.description}>
            Scannez le QRCode suivant sur votre téléphone, ou copiez le lien suivant sur un autre appareil pour vous connecter depuis celui-ci.
          </p>
          <QRCode value={currentAppRequest.link} style={{ marginBottom: 16 }} />
          <input id='link' readOnly defaultValue={currentAppRequest.link} />
          <Button label='Copier' onClick={this.copyLink} />
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
