import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Button.module.scss'

const Button = ({ className, onClick, color, children, width, height, borderRadius, secondary, id }) => (
  <button
    className={cx(
      className,
      styles.Button,
      { [styles[color]]: !secondary },
      { [styles.secondary]: secondary }
    )}
    onClick={onClick}
    id={id}
    style={{
      width,
      maxWidth: width,
      height,
      borderRadius,
      padding: width ? 0 : `0px ${height}px`
    }}
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
  className: PropTypes.string,
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
  id: PropTypes.string,
  borderRadius: PropTypes.number
}

export default Button
