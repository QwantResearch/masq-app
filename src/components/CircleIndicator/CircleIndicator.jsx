import React from 'react'
import PropTypes from 'prop-types'

import styles from './CircleIndicator.module.scss'

const CircleIndicator = ({ color }) => (
  <div className={styles.CircleIndicator} style={{ border: `2px solid ${color}` }} />
)

CircleIndicator.propTypes = {
  color: PropTypes.string.isRequired
}

export default CircleIndicator
