import React from 'react'
import { LogOut } from 'react-feather'
import PropTypes from 'prop-types'

import styles from './Dropdown.module.scss'

const Dropdown = ({ onClick }) => (
  <div className={styles.Dropdown} onClick={onClick}>
    <LogOut size={14} />
    <p>Déconnexion</p>
  </div>
)

Dropdown.propTypes = {
  onClick: PropTypes.func
}

export default Dropdown
