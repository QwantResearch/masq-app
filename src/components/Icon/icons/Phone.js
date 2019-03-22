import React from 'react'

const Phone = props => (
  <svg
    id='phone'
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={16}
    height={22}
    {...props}
  >
    <path
      d='M13 0H3C1.3 0 0 1.3 0 3v16c0 1.7 1.3 3 3 3h10c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3zm1 19c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V3c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v16zm-6-1a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'
    />
  </svg>
)

export default Phone
