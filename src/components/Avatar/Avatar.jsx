import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Camera } from 'react-feather'

import { Typography } from '../'

import styles from './Avatar.module.scss'

const COLORS = [
  styles.colorCyan,
  styles.colorBlue,
  styles.colorGreen,
  styles.colorRed,
  styles.colorBlueGrey,
  styles.colorYellow
]

export default class Avatar extends React.Component {
  constructor (props) {
    super(props)
    this.openDialog = this.openDialog.bind(this)
  }

  openDialog () {
    this.refs.fileDialog.click()
  }

  render () {
    const { size, image, upload, onChange, username } = this.props
    const style = { backgroundImage: 'url(' + image + ')' }

    return (
      <div
        style={{ width: size, height: size }}
        onClick={upload ? this.openDialog : null}
        className={classNames(
          styles.Avatar,
          { [styles.upload]: upload && (image || username) },
          { [styles.new]: !image && !username },
          { [styles.mobile]: size <= 32 }
        )}
      >
        <input
          name='avatar' type='file' ref='fileDialog'
          style={{ display: 'none' }} onChange={onChange}
          accept='.jpg, .jpeg, .png'
        />

        <Camera className={styles.camera} size={42} />

        {!image && username && (
          <div
            className={styles.avatarUsername}
            style={{ backgroundColor: COLORS[username.charCodeAt(0) % COLORS.length] }}
          >
            <Typography type='avatarUsername'>{username[0].toUpperCase()}</Typography>
          </div>
        )}

        {image && <div className={styles.img} style={style} />}
      </div>
    )
  }
}

Avatar.defaultProps = {
  size: 120
}

Avatar.propTypes = {
  size: PropTypes.number,
  upload: PropTypes.bool,
  image: PropTypes.string,
  onChange: PropTypes.func,
  username: PropTypes.string
}
