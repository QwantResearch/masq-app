import React from 'react'
import PropTypes from 'prop-types'

import Image from './Image'
import Header from './Header'
import Title from './Title'
import { Typography } from '..'

import styles from './Card.module.scss'

const Description = ({ description }) => (
  <div className={styles.Description}>
    <Typography type='text' color='#697496'>{description}</Typography>
  </div>
)

Description.propTypes = {
  description: PropTypes.string.isRequired
}

const Card = ({ minHeight, image, title, actions, description, footer, color }) => (
  <div className={styles.Card} style={{ minHeight }}>
    {image && <Image image={image} />}
    <div className={styles.content}>
      <Header color={color}>{actions}</Header>
      {title && <Title title={title} />}
      {description && <Description description={description} /> }
      {footer}
    </div>
  </div>
)

Card.defaultProps = {
  minHeight: 50
}

Card.propTypes = {
  minHeight: PropTypes.number,
  image: PropTypes.string,
  title: PropTypes.string,
  actions: PropTypes.object,
  description: PropTypes.string,
  footer: PropTypes.object,
  color: PropTypes.string.isRequired
}

export default Card
