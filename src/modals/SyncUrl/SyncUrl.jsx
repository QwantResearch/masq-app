import React from 'react'
import PropTypes from 'prop-types'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { HelpCircle } from 'react-feather'

import { setSyncUrl } from '../../actions'
import { Button, Modal, Typography, Space, TextField, OnBoardingCopyLink } from '../../components'
import MediaQuery from 'react-responsive'

import styles from './SyncUrl.module.scss'

class SyncUrl extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      onboarding: false,
      url: ''
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit (e) {
    e.preventDefault()
    this.props.setSyncUrl(this.state.url)
  }

  render () {
    const { t, onClose } = this.props

    if (this.state.onboarding) {
      return <OnBoardingCopyLink onClose={() => this.setState({ onboarding: true })} />
    }

    return (
      <Modal title={t('Paste profile link')} mobileHeader onClose={onClose}>
        <div className={styles.SyncUrl}>
          <Space size={32} />
          <p className={styles.text}>
            {t('Copy the link displayed on your initial device, then paste it in the field "link to existing profile" on this device.')}
          </p>
          <Space size={32} />

          <form style={{ width: '100%' }} onSubmit={this.handleSubmit}>
            <TextField
              className={styles.textField}
              label={t('Link to existing profile')}
              onChange={(e) => this.setState({ url: e.target.value })}
            />
            <Space size={32} />
            <div className={styles.buttons}>
              <MediaQuery minWidth={701}>
                <Button type='button' color='neutral' width={185} onClick={onClose}>{t('go back')}</Button>
              </MediaQuery>
              <Button type='submit' width={185}>{t('Synchronize')}</Button>
            </div>
          </form>
          <Space size={54} />
          <div onClick={() => this.setState({ onboarding: true })} className={styles.onBoardingMessage}>
            <HelpCircle size={14} color='#353c52' />
            <Space size={5} direction='left' />
            <Typography color={styles.colorBlueGrey} type='label'>{t('How to find the profile link?')}</Typography>
          </div>
        </div>
      </Modal>
    )
  }
}

SyncUrl.propTypes = {
  onClose: PropTypes.func,
  t: PropTypes.func,
  setSyncUrl: PropTypes.func
}

const mapDispatchToProps = dispatch => ({
  setSyncUrl: url => dispatch(setSyncUrl(url))
})

export default connect(null, mapDispatchToProps)(withTranslation()(SyncUrl))
