import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Card } from 'qwant-research-components'

import styles from './Devices.module.scss'

const Devices = ({ user, devices }) => {
  if (!user) return <Redirect to='/' />

  return (
    <div className={styles.Devices}>
      <p className='title'>Mes Appareils</p>
      <p className='subtitle'>Retrouvez la liste de vos appareils connectés à Masq</p>
      {devices.map((device, index) => (
        <div key={index} className={styles.Card}>
          <Card minHeight={64} title={device.name} color={device.color} description={device.description} />
        </div>
      ))}
    </div>
  )
}

const mapStateToProps = (state) => ({
  user: state.masq.currentUser,
  devices: state.masq.devices
})

Devices.propTypes = {
  user: PropTypes.object,
  devices: PropTypes.arrayOf(PropTypes.object)
}

export default connect(mapStateToProps)(Devices)
