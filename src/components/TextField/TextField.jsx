import React from 'react'
import PropTypes from 'prop-types'

import cx from 'classnames'

import styles from './TextField.module.scss'
import Typography from '../Typography'

const TextField = ({ className, label, error, type, onChange, onKeyUp, autoFocus, placeholder, defaultValue, large, button, onClick }) => (
  <div
    className={cx(
      className,
      styles.TextField,
      error ? [styles.error] : [styles.default],
      { [styles.large]: large }
    )}
  >
    <input
      onChange={onChange}
      type={type}
      onKeyUp={onKeyUp}
      autoFocus={autoFocus}
      placeholder={placeholder}
      defaultValue={defaultValue}
    />
    <label htmlFor='field'>{label}</label>
    {button && <span onClick={onClick}>
      <Typography className={styles.button} type='textFieldButton'>{button}</Typography>
    </span>}
  </div>
)

TextField.defaultProps = {
  error: false,
  focus: false,
  label: '',
  type: 'text',
  defaultValue: ''
}

TextField.propTypes = {
  large: PropTypes.bool,
  className: PropTypes.string,

  /** The label of the text field */
  label: PropTypes.string,

  /** Set to true if the value is incorrect */
  error: PropTypes.bool,

  /** Onput type */
  type: PropTypes.oneOf(['text', 'password']),

  /** onChange */
  onChange: PropTypes.func,

  onKeyUp: PropTypes.func,

  autoFocus: PropTypes.bool,

  placeholder: PropTypes.string,

  defaultValue: PropTypes.string,

  button: PropTypes.string,

  onClick: PropTypes.func
}

export default TextField
