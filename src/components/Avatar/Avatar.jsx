import React from 'react'
import PropTypes from 'prop-types'

import AvatarBase from './AvatarBase'
import { Camera } from 'react-feather'

import './Avatar.css'

const Replace = ({ size, image, onClick }) =>
  <AvatarBase upload src={image} width={size} height={size} onClick={onClick} />

Replace.propTypes = {
  size: PropTypes.number,
  image: PropTypes.string.isRequired,
  onClick: PropTypes.func
}

const NewUpload = ({ style, onClick }) => (
  <Camera
    className='Avatar upload'
    color='var(--grey-200)'
    style={style}
    onClick={onClick}
  />
)

NewUpload.propTypes = {
  style: PropTypes.object,
  onClick: PropTypes.func
}

export default class Avatar extends React.Component {
  constructor (props) {
    super(props)
    this.openDialog = this.openDialog.bind(this)
  }

  openDialog () {
    this.refs.fileDialog.click()
  }

  render () {
    const { size, image, upload, onChange } = this.props
    const style = { backgroundImage: 'url(' + image + ')' }

    if (upload) {
      return (
        <div>
          <input name='avatar' type='file' ref='fileDialog'
            style={{ display: 'none' }} onChange={onChange}
            accept='.jpg, .jpeg, .png'
          />

          {image
            ? <Replace size={size} image={image} onClick={this.openDialog} />
            : <NewUpload style={style} onClick={this.openDialog} />
          }
        </div>)
    }

    return <AvatarBase src={image} width={size} height={size} />
  }
}

Avatar.defaultProps = {
  size: 120
}

Avatar.propTypes = {
  size: PropTypes.number,
  upload: PropTypes.bool,
  image: PropTypes.string,
  onChange: PropTypes.func
}
