import React from 'react'
import PropTypes from 'prop-types'

import styles from './Card.module.scss'

const Image = ({ image }) => (
  <div className={styles.Image} style={{ backgroundImage: `url(${image})` }} />
)

Image.propTypes = {
  image: PropTypes.string.isRequired
}

export default Image
