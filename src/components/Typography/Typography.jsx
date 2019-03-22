import React from 'react'
import PropTypes from 'prop-types'

import styles from './Typography.module.scss'

const Typography = ({ type, children, color }) => (
  <p className={styles[type]} style={{ color }}>{children}</p>
)

Typography.propTypes = {
  children: PropTypes.string.isRequired,
  color: PropTypes.string,
  type: PropTypes.oneOf([
    'title',
    'label',
    'text'
  ]).isRequired
}

export default Typography
