import React from 'react'
import PropTypes from 'prop-types'

import { ReactComponent as Close } from '../../assets/close.svg'

import './Modal.scss'

export default function Modal ({ onClose, width, height, children }) {
  const modalStyle = {
    height: height,
    width: width
  }

  return (
    <div className='Modal'>
      <div className='overlay' onClick={onClose} />
      <div className='modal' style={modalStyle}>
        {onClose && <Close className='close' width={9} height={9} onClick={onClose} />}
        {children}
      </div>
    </div>
  )
}

Modal.propTypes = {
  onClose: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  children: PropTypes.object
}
