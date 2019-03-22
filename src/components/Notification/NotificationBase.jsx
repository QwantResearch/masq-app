import React from 'react'
import PropTypes from 'prop-types'

import { Check, Close } from '../Icon/icons'

import styles from './NotificationBase.module.scss'

function Notification ({ error, title, onClose }) {
  const Icon = error
    ? <Close width={8} color='#e74538' />
    : <Check width={13} color='#308251' />

  return (
    <div className={styles.Notification}>
      <div className={styles.title}>
        <div className={styles.iconContainer}>
          {Icon}
        </div>
        <p>{title}</p>
      </div>
      <Close className={styles.closeBtn} onClick={onClose} />
    </div>
  )
}

Notification.propTypes = {
  error: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string.isRequired
}

export default Notification
