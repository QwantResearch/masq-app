import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Typography.module.scss'

const Typography = ({ className, type, children, color, align }) => (
  <p className={cx(styles.typography, styles[type], className)} style={{ color, textAlign: align }}>{children}</p>
)

Typography.propTypes = {
  className: PropTypes.string,
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
    'username-alt',
    'label',
    'label-nav',
    'footer',
    'textFieldButton',
    'avatarUsername'
  ]).isRequired,
  align: PropTypes.string
}

export default Typography
