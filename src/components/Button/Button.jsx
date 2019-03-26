import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Button.module.scss'

const Button = ({ onClick, color, children, width }) => (
  <button
    className={cx(styles.Button, styles[color])}
    onClick={onClick}
    style={{ width }}
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
  children: PropTypes.string
}

export default Button
