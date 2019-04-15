import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Button.module.scss'

const Button = ({ onClick, color, children, width, secondary }) => (
  <button
    className={cx(
      styles.Button,
      { [styles[color]]: !secondary },
      { [styles.secondary]: secondary }
    )}
    onClick={onClick}
    style={{ width, padding: width ? 0 : '0px 50px' }}
  >
    <span>{children}</span>
  </button>
)

Button.defaultProps = {
  color: 'primary'
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
  secondary: PropTypes.bool,
  children: PropTypes.string
}

export default Button
