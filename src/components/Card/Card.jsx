import React from 'react'
import PropTypes from 'prop-types'

import Image from './Image'
import { Typography } from '..'

import styles from './Card.module.scss'

const Description = ({ description }) => (
  <div className={styles.Description}>
    <Typography type='paragraph' color='#697496'>{description}</Typography>
  </div>
)

Description.propTypes = {
  description: PropTypes.string.isRequired
}

const Card = ({ minHeight, image, title, actions, description, footer, color, width }) => (
  <div className={styles.Card} style={{ minHeight, width }}>
    {image && <Image image={image} />}
    <div className={styles.content}>
      <div className={styles.Header}>
        <div className={styles.marker} style={{ backgroundColor: color }} />
        {actions}
      </div>
      {title && <Typography type='title-card'>{title}</Typography>}
      {description && <Description description={description} /> }
      {footer}
    </div>
  </div>
)

Card.defaultProps = {
  minHeight: 50
}

Card.propTypes = {
  width: PropTypes.number,
  minHeight: PropTypes.number,
  image: PropTypes.string,
  title: PropTypes.string,
  actions: PropTypes.object,
  description: PropTypes.string,
  footer: PropTypes.object,
  color: PropTypes.string.isRequired
}

export default Card
