import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Plus } from 'react-feather'
import MediaQuery from 'react-responsive'

import { Card, Button, Typography, Space, FloatingButton } from '../../components'
import { withTranslation } from 'react-i18next'
import { QRCodeModal } from '../../modals'

import styles from './Devices.module.scss'

class Devices extends React.Component {
  constructor (props) {
    super(props)
    this.state = { addDevice: false }
    this.handleAddDeviceClick = this.handleAddDeviceClick.bind(this)
    this.handleAddDeviceClose = this.handleAddDeviceClose.bind(this)
  }

  handleAddDeviceClick () {
    this.setState({ addDevice: true })
  }

  handleAddDeviceClose () {
    this.setState({ addDevice: false })
  }

  render () {
    const { user, devices, t } = this.props
    const { addDevice } = this.state

    if (!user) return <Redirect to='/' />

    return (
      <div className={styles.Devices}>
        {addDevice && <QRCodeModal link='https://qwant.com' onClose={this.handleAddDeviceClose} />}

        <div className={styles.topSection}>
          <Typography type='title-page'>{t('My devices')}</Typography>
          <MediaQuery minWidth={701}>
            <Button
              className={styles.addDeviceBtn}
              onClick={() => this.handleAddDeviceClick()}
            >
              {t('Add a new device')}
            </Button>
          </MediaQuery>
        </div>

        <Space size={16} />
        <div className={styles.cards}>
          {devices.map((device, index) => (
            <div key={index} className={styles.Card}>
              <Card title={device.name} color={device.color} description={device.description} />
            </div>
          ))}
        </div>

        <MediaQuery maxWidth={styles.mobileWidth}>
          <FloatingButton className={styles.FloatingButton} onClick={() => this.handleAddDeviceClick()}>
            <Plus />
          </FloatingButton>
        </MediaQuery>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  user: state.masq.currentUser,
  devices: state.masq.devices
})

Devices.propTypes = {
  user: PropTypes.object,
  devices: PropTypes.arrayOf(PropTypes.object),
  t: PropTypes.func
}
const translatedDevices = withTranslation()(Devices)
export default connect(mapStateToProps)(translatedDevices)
