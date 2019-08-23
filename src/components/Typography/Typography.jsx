import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './Typography.module.scss'

const Typography = ({ className, id, maxWidth, type, children, color, align, line }) => (
  <p
    className={cx(
      { [styles.line]: line },
      styles.typography,
      styles[type],
      className
    )}
    id={id}
    style={{
      color,
      textAlign: align,
      maxWidth
    }}
  >
    {children}
  </p>
)

Typography.propTypes = {
  className: PropTypes.string,
  id: PropTypes.string,
  maxWidth: PropTypes.number,
  children: PropTypes.any.isRequired,
  color: PropTypes.string,
  type: PropTypes.oneOf([
    'title',
    'title-landing',
    'title-landing2',
    'title-modal',
    'title-page',
    'subtitle-page',
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
  align: PropTypes.string,
  line: PropTypes.bool
}

export default Typography
