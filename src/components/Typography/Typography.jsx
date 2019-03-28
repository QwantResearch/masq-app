import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Typography.module.scss'

const Typography = ({ type, children, color, align }) => (
  <p className={cx(styles.typography, styles[type])} style={{ color, textAlign: align }}>{children}</p>
)

Typography.propTypes = {
  children: PropTypes.string.isRequired,
  color: PropTypes.string,
  type: PropTypes.oneOf([
    'title',
    'title-modal',
    'title-page',
    'paragraph',
    'paragraph-modal',
    'username',
    'label',
    'label-nav'
  ]).isRequired,
  align: PropTypes.string
}

export default Typography
