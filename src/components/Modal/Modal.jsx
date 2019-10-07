import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import MediaQuery from 'react-responsive'
import { X, ArrowLeft } from 'react-feather'

import styles from './Modal.module.scss'
import { Typography } from '../../components'

const Modal = ({ title, onClose, width, padding, children }) => (
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
      <MediaQuery maxWidth={styles.mobileWidth}>
        <div className={styles.mobileHeader}>
          <div className={styles.backButton} onClick={onClose}>
            <ArrowLeft />
          </div>
          <Typography type='title-modal-mobile'>{title}</Typography>
        </div>
      </MediaQuery>
      <MediaQuery minWidth={701}>
        {onClose && <X className={styles.close} size={16} onClick={onClose} />}
        <Typography type='title-modal'>{title}</Typography>
      </MediaQuery>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  </div>
)

const ResponsiveModal = ({ title, onClose, width, children, padding }) => {
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
        <Modal title={title} width='100%' onClose={onClose} children={children} />
      </MediaQuery>
      <MediaQuery minWidth={701}>
        <Modal title={title} width={width} onClose={onClose} children={children} padding={padding} />
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
  ]),
  title: PropTypes.string.isRequired
}

Modal.defaultProps =
ResponsiveModal.defaultProps = {
  padding: 32
}

export default ResponsiveModal
