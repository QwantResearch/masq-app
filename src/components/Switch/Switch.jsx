import React from 'react'
import PropTypes from 'prop-types'

import Typography from '../Typography'
import SwitchButton from './SwitchButton'

import styles from './Switch.module.scss'

const Switch = (props) => (
  props.label
    ? (
      <div className={styles.Switch}>
        <Typography type='label' color={props.color}>{props.label}</Typography>
        <SwitchButton {...props} />
      </div>
    )
    : <SwitchButton {...props} />
)

Switch.defaultProps = {
  checked: false,
  secondary: false,
  label: ''
}

Switch.propTypes = {
  /** Initial checked state */
  checked: PropTypes.bool,

  /** secondary style */
  secondary: PropTypes.bool,

  /** Label to display */
  label: PropTypes.string,

  /** Current color */
  color: PropTypes.string.isRequired,

  /** onChange handler */
  onChange: PropTypes.func
}

export default Switch
