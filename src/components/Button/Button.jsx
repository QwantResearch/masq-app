import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Button.module.scss'

const Button = ({ secondary, onClick, color, label }) => (
  <button
    className={cx(
      styles.Button,
      secondary ? styles.secondary : styles.primary,
      { [styles.animate]: !secondary && !color }
    )}
    style={{
      backgroundColor: color,
      border: `solid 2px ${color}`
    }}
    onClick={onClick}
  >
    <span className={styles.label}>{label}</span>
  </button>
)

Button.defaultProps = {
  secondary: false,
  onClick: undefined
}

Button.propTypes = {
  /** button is of type secondary if true */
  secondary: PropTypes.bool,
  /** onClick event */
  onClick: PropTypes.func,
  color: PropTypes.string,
  /** the button's label */
  label: PropTypes.string.isRequired
}

export default Button
