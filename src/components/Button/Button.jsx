import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Button.module.scss'

const Button = ({ onClick, color, children }) => (
  <button
    className={cx(styles.Button, styles[color])}
    onClick={onClick}
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
  children: PropTypes.string
}

export default Button
