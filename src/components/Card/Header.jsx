import React from 'react'
import PropTypes from 'prop-types'

import styles from './Card.module.scss'

const Header = ({ color, children }) => (
  <div className={styles.Header}>
    <div className={styles.marker} style={{ backgroundColor: color }} />
    {children}
  </div>
)

Header.propTypes = {
  color: PropTypes.string.isRequired,
  children: PropTypes.func
}

export default Header
