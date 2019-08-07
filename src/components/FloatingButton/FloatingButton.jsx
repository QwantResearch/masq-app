import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import styles from './FloatingButton.module.scss'

const FloatingButton = ({ className, children, onClick }) => (
  <div
    className={classNames(
      className,
      [styles.FloatingButton]
    )}
    onClick={onClick}
  >
    {children}
  </div>
)

FloatingButton.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func
}

export default FloatingButton
