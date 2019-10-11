import React from 'react'
import PropTypes from 'prop-types'
import QRCode from 'qrcode.react'
import { Copy } from 'react-feather'
import { withTranslation } from 'react-i18next'
import classNames from 'classnames'
import { connect } from 'react-redux'

import { getMasqInstance } from '../../actions'
import { Modal, Typography, Space, TextField } from '../../components'
import { SyncDevice } from '../../modals'
import SyncProfile from '../../lib/sync-profile'

import styles from './QRCodeModal.module.scss'

const Pill = ({ children }) => <div className={styles.pill}>{children}</div>

Pill.propTypes = {
  children: PropTypes.string.isRequired
}

class QRCodeModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      copied: false,
      link: '',
      syncStep: null,
      message: null
    }
    this.sp = null
    this.handleClose = this.handleClose.bind(this)
  }

  async startSync () {
    const { t, profile } = this.props
    this.sp = new SyncProfile()
    await this.sp.init()
    const secureLink = await this.sp.getSecureLink()
    this.setState({ link: secureLink })

    try {
      await this.sp.joinSecureChannel()
      // Start Sync animation
      this.setState({ syncStep: 'syncing' })
      const publicProfile = {
        username: profile.username,
        image: profile.image,
        id: profile.id
      }
      const masq = getMasqInstance()
      const db = masq.profileDB
      await this.sp.pushProfile(db, profile.id, publicProfile)
      this.setState({ syncStep: 'finished' })
    } catch (e) {
      switch (e.message) {
        case 'abort':
          this.setState({ message: t('The sync process has been aborted, please try again.') })
          break
        case 'alreadySynced':
          this.setState({ message: t('This profile is already synchronized on this device.') })
          break
        case 'usernameAlreadyExists':
          this.setState({ message: t('A profile with the same username already exists in this device, rename it and try again.') })
          break
        default:
          this.setState({ message: t('Error during the synchronization. Please retry.') })
      }
      this.setState({ syncStep: 'error' })
    }
  }

  copyLink () {
    const link = document.querySelector('#qrcode input')
    link.select()
    document.execCommand('copy')
    this.setState({ copied: true })
    setTimeout(() => this.setState({ copied: false }), 3000)
  }

  handleClose () {
    const { onClose } = this.props
    this.sp.sw.close()
    onClose()
  }

  async componentDidMount () {
    await this.startSync()
  }

  render () {
    const { link, copied, syncStep, message } = this.state
    const { t, onClose } = this.props

    if (syncStep) {
      return <SyncDevice step={syncStep} onClick={onClose} onClose={() => this.handleClose()} message={message} />
    }

    return (
      <Modal title={t('Add a device')} mobileHeader onClose={() => this.handleClose()}>
        <div id='qrcode' className={styles.QRCode}>
          <Space size={32} />
          <Typography maxWidth={320} type='paragraph-modal' align='center'>
            {t('Scan this QR Code with the device you want to synchronize:')}
          </Typography>
          <Space size={18} />
          <QRCode value={link} />
          <Space size={26} />
          <Typography
            line
            align='center'
            type='paragraph-modal'
            color={styles.colorBlueGrey}
          >
            {t('or')}
          </Typography>
          <Space size={22} />
          <Typography maxWidth={320} type='paragraph-modal' align='center'>
            {t(
              'Copy the following link and paste it in the browser you want to use:'
            )}
          </Typography>
          <Space size={24} />
          <TextField
            className={classNames(styles.input, { [styles.copied]: copied })}
            readOnly
            defaultValue={link}
            button={<Copy style={{ height: 40 }} />}
            height={36}
            onClick={() => this.copyLink()}
          />
          <Space size={8} />
          {copied && <Pill>{t('Link Copied !')}</Pill>}
          {!copied && <Space size={28} />}
          <Space size={16} />
        </div>
      </Modal>
    )
  }
}

QRCodeModal.propTypes = {
  onClose: PropTypes.func,
  profile: PropTypes.object.isRequired,
  t: PropTypes.func
}

const mapStateToProps = state => ({
  profile: state.masq.currentUser,
  devices: state.masq.devices
})

const translatedQRCodeModal = withTranslation()(QRCodeModal)
export default connect(mapStateToProps)(translatedQRCodeModal)
