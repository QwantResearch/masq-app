import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Plus } from 'react-feather'
import MediaQuery from 'react-responsive'

import { fetchDevices } from '../../actions'
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

  componentDidMount () {
    this.props.fetchDevices()
  }

  handleAddDeviceClick () {
    this.setState({ addDevice: true })
  }

  handleAddDeviceClose () {
    this.setState({ addDevice: false })
  }

  render () {
    const { devices, t } = this.props
    const { addDevice } = this.state

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
              <Card
                minHeight={120}
                title={device.name}
                color={styles.colorGreen}
                description={device.current ? 'This device' : ''}
              />
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

const mapDispatchToProps = dispatch => ({
  fetchDevices: () => dispatch(fetchDevices())
})

Devices.propTypes = {
  devices: PropTypes.arrayOf(PropTypes.object),
  t: PropTypes.func,
  fetchDevices: PropTypes.func.isRequired
}
const translatedDevices = withTranslation()(Devices)
export default connect(mapStateToProps, mapDispatchToProps)(translatedDevices)
