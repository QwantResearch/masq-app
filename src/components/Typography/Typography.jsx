import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Typography.module.scss'

const Typography = ({ type, children, color, align }) => (
  <p className={cx(styles.typography, styles[type])} style={{ color, textAlign: align }}>{children}</p>
)

Typography.propTypes = {
  children: PropTypes.any.isRequired,
  color: PropTypes.string,
  type: PropTypes.oneOf([
    'title',
    'title-landing',
    'title-landing2',
    'title-modal',
    'title-page',
    'title-card',
    'paragraph',
    'paragraph-landing',
    'paragraph-landing-dark',
    'paragraph-modal',
    'username',
    'label',
    'label-nav',
    'footer'
  ]).isRequired,
  align: PropTypes.string
}

export default Typography
