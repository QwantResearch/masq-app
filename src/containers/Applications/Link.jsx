import React from 'react'
import PropTypes from 'prop-types'
import { ExternalLink } from 'react-feather'
import { useTranslation } from 'react-i18next'

import { Typography } from '../../components'
import styles from './Applications.module.scss'

const Link = ({ url }) => {
  const { t } = useTranslation()

  return (
    <div className={styles.Link}>
      <ExternalLink color={styles.colorBlueGrey} />
      <Typography type='label' color={styles.colorBlueGrey}>
        <a href={url} rel='noopener noreferrer' target='_blank'>{t('Open application')}</a>
      </Typography>
    </div>
  )
}

Link.propTypes = {
  url: PropTypes.string
}

export default Link
