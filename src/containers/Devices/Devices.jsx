import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import styles from './Devices.module.scss'

const Devices = ({ user }) => {
  if (!user) return <Redirect to='/' />

  return (
    <div className={styles.Apps}>
      <p className='title'>Mes Appareils</p>
      <p className='subtitle'>Retrouvez la liste de vos appareils connectés à Masq</p>
    </div>
  )
}

const mapStateToProps = (state) => ({
  user: state.masq.currentUser
})

Devices.propTypes = {
  user: PropTypes.object
}

export default connect(mapStateToProps)(Devices)
