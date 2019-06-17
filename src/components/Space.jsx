import React from 'react'
import PropTypes from 'prop-types'

import { capitalize } from '../lib/utils'

const Space = ({ size, direction }) => (
  <div style={{ [`margin${capitalize(direction)}`]: size }} />
)

Space.defaultProps = {
  direction: 'bottom'
}

Space.propTypes = {
  size: PropTypes.number.isRequired,
  direction: PropTypes.oneOf([
    'top',
    'right',
    'bottom',
    'left'
  ])
}

export default Space
