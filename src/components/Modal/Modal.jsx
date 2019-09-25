import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import MediaQuery from 'react-responsive'

import { X } from 'react-feather'

import styles from './Modal.module.scss'

const Modal = ({ onClose, width, padding, children }) => (
  <div className={styles.Modal}>
    <div className={styles.overlay} onClick={onClose} />
    <div
      className={styles.modal}
      style={{
        width,
        paddingTop: padding,
        paddingLeft: padding,
        paddingRight: padding
      }}
    >
      {onClose && <X className={styles.close} size={16} onClick={onClose} />}
      {children}
    </div>
  </div>
)

const ResponsiveModal = ({ onClose, width, children, padding }) => {
  useEffect(() => {
    window.document.body.style.overflow = 'hidden'

    // cleanup
    return () => {
      window.document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div>
      <MediaQuery maxWidth={styles.mobileWidth}>
        <Modal width='100%' onClose={onClose} children={children} />
      </MediaQuery>
      <MediaQuery minWidth={701}>
        <Modal width={width} onClose={onClose} children={children} padding={padding} />
      </MediaQuery>
    </div>
  )
}

Modal.propTypes =
ResponsiveModal.propTypes = {
  onClose: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  padding: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ])
}

export default ResponsiveModal
