import React from 'react'
import PropTypes from 'prop-types'

const Space = ({ size }) => (
  <div style={{ marginBottom: size }} />
)

Space.propTypes = {
  size: PropTypes.number.isRequired
}

export default Space
