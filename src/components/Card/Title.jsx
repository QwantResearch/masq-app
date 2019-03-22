import React from 'react'
import PropTypes from 'prop-types'

import { Typography } from '..'

import styles from './Card.module.scss'

const Title = ({ title }) => (
  <div className={styles.Title}>
    <Typography type='title' color='#252a39'>{title}</Typography>
  </div>
)

Title.propTypes = {
  title: PropTypes.string.isRequired
}

export default Title
