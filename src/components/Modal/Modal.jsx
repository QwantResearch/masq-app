import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useMediaQuery } from 'react-responsive'
import { X, ArrowLeft } from 'react-feather'

import styles from './Modal.module.scss'
import { Typography, Space } from '../../components'

const Modal = ({ title, mobileHeader, onClose, onBack, children }) => {
  const isMobile = useMediaQuery({ maxWidth: styles.mobileWidth })

  return (
    <div className={styles.Modal}>
      <div className={styles.overlay} onClick={onClose} />
      <div
        className={styles.modal}
      >
        {isMobile && mobileHeader
          ? (
            <div className={styles.mobileHeader}>
              <div className={styles.backButton} onClick={onBack || onClose}>
                <ArrowLeft />
              </div>
              <Typography type='title-modal-mobile'>{title}</Typography>
            </div>
          ) : (
            <div>
              <Space size={32} />
              {onClose && <X className={styles.close} size={16} onClick={onClose} />}
              <Typography type='title-modal'>{title}</Typography>
            </div>
          )}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}

const ResponsiveModal = ({ title, mobileHeader, onClose, width, children, onBack }) => {
  const isMobile = useMediaQuery({ maxWidth: styles.mobileWidth })

  useEffect(() => {
    window.document.body.style.overflow = 'hidden'

    // cleanup
    return () => {
      window.document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div>
      {isMobile
        ? <Modal title={title} mobileHeader={mobileHeader} onBack={onBack} onClose={onClose} children={children} />
        : <Modal title={title} onClose={onClose} children={children} />}
    </div>
  )
}

Modal.propTypes =
ResponsiveModal.propTypes = {
  onClose: PropTypes.func,
  onBack: PropTypes.func,
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object
  ]),
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  title: PropTypes.string.isRequired,
  mobileHeader: PropTypes.bool
}

Modal.defaultProps =
ResponsiveModal.defaultProps = {
  padding: 32
}

export default ResponsiveModal
