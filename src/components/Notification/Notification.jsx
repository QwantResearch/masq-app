import React from 'react'
import PropTypes from 'prop-types'
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

NotificationMasq.propTypes = {
  setNotification: PropTypes.func
}

export default connect(null, mapDispatchToProps)(NotificationMasq)
