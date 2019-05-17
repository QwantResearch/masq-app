import React from 'react'
import { LogOut } from 'react-feather'
import PropTypes from 'prop-types'

import { useTranslation } from 'react-i18next'
import styles from './Dropdown.module.scss'

const Dropdown = ({ onClick }) => {
  const { t } = useTranslation()
  return (
    <div className={styles.Dropdown} onClick={onClick}>
      <LogOut size={14} />
      <p>{t('Sign out')}</p>
    </div>
  )
}

Dropdown.propTypes = {
  onClick: PropTypes.func
}

export default Dropdown
