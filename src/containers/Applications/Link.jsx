import React from 'react'
import PropTypes from 'prop-types'
import { ExternalLink } from 'react-feather'

import { Typography } from '../../components'
import styles from './Applications.module.scss'

const Link = ({ url }) => (
  <div className={styles.Link}>
    <ExternalLink color={styles.colorBlueGrey} />
    <Typography type='label' color={styles.colorBlueGrey}>
      <a href={url} rel='noopener noreferrer' target='_blank'>Ouvrir l'application</a>
    </Typography>
  </div>
)

Link.propTypes = {
  url: PropTypes.string
}

export default Link
