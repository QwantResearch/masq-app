import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'

import { signin, setSyncStep } from '../../actions'
import { SyncDevice } from '../../modals'
import SyncProfile from '../../lib/sync-profile'

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

  componentDidMount () {
    const { link, setSyncStep, t } = this.props
    let hash = ''
    try {
      setSyncStep('syncing')
      const url = new URL(link)
      if (url.hash.substring(0, 7) !== '#/sync/') return
      hash = url.hash.substr(7) // ignore #/sync/ characters
      if (!hash.length) throw new Error('invalid link')
      this.startSync(hash)
    } catch (e) {
      if (e.message === 'Failed to construct \'URL\': Invalid URL') {
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
      if (msg !== 'pullProfile') throw new Error('Unexpected message')
      await this.sp.init(channel, Buffer.from(key, 'base64'))
      await this.sp.joinSecureChannel()
      await this.sp.pullProfile()
      const profile = this.sp.publicProfile
      this.setState({ profile })
      this.props.setSyncStep('password')
    } catch (e) {
      this.setState({ message: 'error' })
      this.props.setSyncStep('error')
      if (e.message === 'alreadySynced') {
        this.setState({ message: t('This profile is already synchronized on this device.') })
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
      setSyncStep('finished')
    } catch (e) {
      this.setState({ errorPass: true })
    }
  }

  async handleClose () {
    if (this.props.syncStep === 'finished') {
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
