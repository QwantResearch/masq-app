import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import NotificationBase from './NotificationBase'
import { setNotification } from '../../actions/index'

import styles from './Notification.module.scss'

const TIMEOUT = 5000

const Notification = ({ setNotification, ...props }) => {
  setTimeout(() => setNotification(null), TIMEOUT)

  return (
    <div className={styles.Notification}>
      <NotificationBase {...props} onClose={() => setNotification(null)} />
    </div>
  )
}

const mapDispatchToProps = dispatch => ({
  setNotification: notif => dispatch(setNotification(notif))
})

Notification.propTypes = {
  setNotification: PropTypes.func
}

export default connect(null, mapDispatchToProps)(Notification)
