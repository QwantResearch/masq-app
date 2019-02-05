import React from 'react'
import PropTypes from 'prop-types'
import MediaQuery from 'react-responsive'

import { ReactComponent as Close } from '../../assets/close.svg'

import './Modal.scss'

const Modal = ({ onClose, width, height, children }) => (
  <div className='Modal'>
    <div className='overlay' onClick={onClose} />
    <div className='modal' style={{ width, height }}>
      {onClose && <Close className='close' width={9} height={9} onClick={onClose} />}
      {children}
    </div>
  </div>
)

const ResponsiveModal = ({ onClose, width, height, children }) => (
  <div>
    <MediaQuery maxWidth={800}>
      <Modal width='100%' onClose={onClose} height={height} children={children} />
    </MediaQuery>
    <MediaQuery minWidth={801}>
      <Modal width={width} onClose={onClose} height={height} children={children} />
    </MediaQuery>
  </div>
)

Modal.propTypes =
ResponsiveModal.propTypes = {
  onClose: PropTypes.func,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  height: PropTypes.number,
  children: PropTypes.object
}

export default ResponsiveModal
