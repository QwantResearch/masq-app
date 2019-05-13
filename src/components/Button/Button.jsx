import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Button.module.scss'

const Button = ({ onClick, color, children, width, height, borderRadius, secondary }) => (
  <button
    className={cx(
      styles.Button,
      { [styles[color]]: !secondary },
      { [styles.secondary]: secondary }
    )}
    onClick={onClick}
    style={{
      width,
      height,
      borderRadius,
      padding: width ? 0 : `0px ${height}px` }}
  >
    <span>{children}</span>
  </button>
)

Button.defaultProps = {
  color: 'primary',
  height: 50,
  borderRadius: 6
}

Button.propTypes = {
  onClick: PropTypes.func,
  color: PropTypes.oneOf([
    'primary',
    'success',
    'danger',
    'neutral',
    'light'
  ]),
  width: PropTypes.number,
  height: PropTypes.number,
  secondary: PropTypes.bool,
  children: PropTypes.string,
  borderRadius: PropTypes.number
}

export default Button
