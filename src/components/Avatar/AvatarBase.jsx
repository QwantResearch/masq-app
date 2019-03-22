import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import { Icon } from '..'

import styles from './AvatarBase.module.scss'

const Avatar = ({ src, width, height, onClick, upload }) => (
  <div className={cx(styles.Avatar, { [styles.upload]: upload })} style={{ width, height }}>
    <img
      alt={src}
      width={width}
      height={height}
      src={src}
      onClick={onClick}
    />
    {upload && (
      <Icon
        name='Camera'
        className={styles.icon}
        height={33}
        width={40}
        color='white'
        onClick={onClick}
      />
    )}
  </div>
)

Avatar.defaultProps = {
  width: 64,
  height: 64,
  upload: false
}

Avatar.propTypes = {
  src: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
  onClick: PropTypes.func,
  /** Grey out the image and display a camera icon on hover */
  upload: PropTypes.bool
}

export default Avatar
