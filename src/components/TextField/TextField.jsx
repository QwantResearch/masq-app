import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Eye, EyeOff } from 'react-feather'

import cx from 'classnames'

import { Typography } from '..'
import styles from './TextField.module.scss'

const TextField = ({ className, id, label, error, type, onChange, onKeyUp, autoFocus, placeholder, defaultValue, large, button, onClick, password, readOnly, height }) => {
  const [visible, setVisible] = useState(false)

  const handleClick = () => {
    if (password) {
      setVisible(!visible)
    }
    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={cx(
        className,
        styles.TextField,
        error ? [styles.error] : [styles.default],
        { [styles.password]: password },
        { [styles.large]: large },
        { [styles.textFieldButton]: button }
      )}
    >
      <input
        onChange={onChange}
        type={visible ? 'text' : type}
        onKeyUp={onKeyUp}
        autoFocus={autoFocus}
        id={id}
        placeholder={placeholder}
        defaultValue={defaultValue}
        readOnly={readOnly}
        style={{ height }}
      />
      <label htmlFor='field'>{label}</label>

      {(password || button) && (
        <div onClick={handleClick} className={styles.button} style={{ height: height }}>
          {password && visible && defaultValue.length > 0 && <EyeOff />}
          {password && !visible && defaultValue.length > 0 && <Eye />}
          {button && <Typography type='textFieldButton'>{button}</Typography>}
        </div>
      )}
    </div>
  )
}

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
  id: PropTypes.string,

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

  button: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),

  onClick: PropTypes.func,

  password: PropTypes.bool,

  readOnly: PropTypes.bool,

  height: PropTypes.number
}

export default TextField
