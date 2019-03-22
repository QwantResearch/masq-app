import React from 'react'
import cx from 'classnames'
import PropTypes from 'prop-types'

import styles from './Switch.module.scss'

const SwitchButton = ({ checked, secondary, onChange, color }) => (
  <label className={cx(styles.SwitchButton, { [styles.secondary]: secondary })}>
    <input type='checkbox' checked={checked} onChange={onChange} />
    <span className={styles.slider} style={{ backgroundColor: color }} />
  </label>
)

SwitchButton.propTypes = {
  checked: PropTypes.bool,
  secondary: PropTypes.bool,
  onChange: PropTypes.func,
  color: PropTypes.string.isRequired
}

export default SwitchButton
