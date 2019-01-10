import React from 'react'
import { Notification } from 'qwant-research-components'
import { connect } from 'react-redux'

import { setNotification } from '../../actions/index'

import styles from './Notification.module.scss'

const NotificationMasq = ({ setNotification, ...props }) => (
  <div className={styles.Notification}>
    <Notification {...props} onClose={() => setNotification(null)} />
  </div>
)

const mapDispatchToProps = dispatch => ({
  setNotification: notif => dispatch(setNotification(notif))
})

export default connect(null, mapDispatchToProps)(NotificationMasq)
