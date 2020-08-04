import React from 'react'
import PropTypes from 'prop-types'

import { Check, X } from 'react-feather'

import styles from './NotificationBase.module.scss'

const NotificationBase = ({ error, title, withoutIcon = false, onClose }) => {
  const Icon = error
    ? <X width={14} color='#e74538' />
    : <Check width={13} color='#308251' />

  console.log('typeof title', title)

  return (
    <div className={styles.Notification}>
      <div className={styles.title}>
        {!withoutIcon &&
          <div className={styles.iconContainer}>
            {Icon}
          </div>}
        <p>{title}</p>
      </div>
      <X className={styles.closeBtn} onClick={onClose} />
    </div>
  )
}

NotificationBase.propTypes = {
  error: PropTypes.bool,
  onClose: PropTypes.func,
  withoutIcon: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired
}

export default NotificationBase
