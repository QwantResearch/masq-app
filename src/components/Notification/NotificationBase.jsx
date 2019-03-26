import React from 'react'
import PropTypes from 'prop-types'

import { Check, X } from 'react-feather'

import styles from './NotificationBase.module.scss'

const NotificationBase = ({ error, title, onClose }) => {
  const Icon = error
    ? <X width={14} color='#e74538' />
    : <Check width={13} color='#308251' />

  return (
    <div className={styles.Notification}>
      <div className={styles.title}>
        <div className={styles.iconContainer}>
          {Icon}
        </div>
        <p>{title}</p>
      </div>
      <X className={styles.closeBtn} onClick={onClose} />
    </div>
  )
}

NotificationBase.propTypes = {
  error: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.string.isRequired
}

export default NotificationBase
