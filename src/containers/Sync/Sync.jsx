import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import { signin, setSyncStep, getMasqInstance } from '../../actions'
import { SyncDevice } from '../../modals'
import SyncProfile from '../../lib/sync-profile'
import { promiseTimeout } from '../../lib/utils'

class Sync extends Component {
  constructor (props) {
    super(props)
    this.state = {
      profile: { username: '', image: '' },
      errorPass: false,
      message: null,
      pass: ''
    }
    this.sp = null
    this.startSync = this.startSync.bind(this)
    this.authenticate = this.authenticate.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  async componentDidMount () {
    const { link, setSyncStep, t } = this.props
    let hash = ''
    try {
      setSyncStep('syncing')
      const url = new URL(link)
      if (url.hash.substring(0, 7) !== '#/sync/' ||
          url.origin !== window.location.origin) {
        throw new Error('invalid link')
      }
      hash = url.hash.substr(7) // ignore #/sync/ characters
      if (!hash.length) throw new Error('invalid link')
      await this.startSync(hash)
    } catch (e) {
      if (e.message === 'Failed to construct \'URL\': Invalid URL' ||
          e.message === 'invalid link') {
        this.setState({ message: t('This synchronization link is invalid. Please go back to the profile you want to import and generate a new link or QR code.') })
      }
      setSyncStep('error')
    }
  }

  async startSync (hash) {
    const { t } = this.props
    const decoded = Buffer.from(hash, 'base64')
    this.sp = new SyncProfile()

    try {
      const [msg, channel, key] = JSON.parse(decoded)
      if (!msg || !channel || !key) throw new Error('invalid link')

      if (msg !== 'pullProfile') throw new Error('Unexpected message')
      await this.sp.init(channel, Buffer.from(key, 'base64'))
      await promiseTimeout(15000, this.sp.joinSecureChannel())
      await this.sp.pullProfile()
      const profile = this.sp.publicProfile
      this.setState({ profile })
      this.props.setSyncStep('password')
    } catch (e) {
      this.props.setSyncStep('error')
      switch (e.message) {
        case 'alreadySynced':
          this.setState({ message: t('This profile is already synchronized on this device.') })
          break
        case 'timeout':
          this.setState({ message: t('The link has expired. Please retry with a fresh link.') })
          break
        case 'usernameAlreadyExists':
          this.setState({ message: t('A profile with the same username already exists in this device, rename it and try again.') })
          break
        default:
          this.setState({ message: t('Error during the synchronization. Please retry.') })
      }
    }
  }

  async authenticate (pass) {
    const { profile } = this.state
    const { signin, setSyncStep } = this.props
    try {
      await signin(profile, pass)
      setSyncStep('syncing')
      await this.sp.requestWriteAccess()
      const masq = getMasqInstance()
      await this.sp.waitUntilAppsDBsAreWritable(masq)
      await this.sp.sendEnd()
      setSyncStep('finished')
    } catch (e) {
      this.setState({ errorPass: true })
    }
  }

  async handleClose () {
    if (this.props.syncStep === 'finished' ||
        this.props.syncStep === 'error') {
      return this.props.onClose()
    }
    if (this.props.syncStep === 'error') {
      return this.props.onClose()
    }
    const { profile } = this.state
    const dbName = `profile-${profile.id}`
    window.indexedDB.deleteDatabase(dbName)
    window.localStorage.removeItem(dbName)
    await this.sp.abort()
    this.props.onClose()
    // FIXME: Workaround to avoir a bug where Chrome blocks
    // when trying to find a previously deleted IndexedDB
    window.location.reload()
  }

  render () {
    const { message, profile, errorPass } = this.state
    const { syncStep } = this.props
    if (!syncStep || !syncStep.length) return null
    return syncStep === 'password'
      ? <SyncDevice step='password' error={errorPass} onClose={() => this.handleClose()} profile={profile} onClick={(pass) => this.authenticate(pass)} />
      : <SyncDevice step={syncStep} message={message} onClick={() => this.handleClose()} onClose={() => this.handleClose()} />
  }
}

Sync.propTypes = {
  link: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  signin: PropTypes.func,
  setSyncStep: PropTypes.func.isRequired,
  syncStep: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired
}

const mapDispatchToProps = dispatch => ({
  signin: (user, passphrase) => dispatch(signin(user, passphrase)),
  setSyncStep: (step) => dispatch(setSyncStep(step))
})

const mapStateToProps = (state) => ({
  syncStep: state.masq.syncStep
})

const translatedSync = withTranslation()(Sync)
export default connect(mapStateToProps, mapDispatchToProps)(translatedSync)
