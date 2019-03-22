import React from 'react'

const Camera = props => (
  <svg
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={24}
    height={20}
    viewBox='0 0 24 20'
    {...props}
  >
    <defs>
      <path
        id='camera-svg'
        d='M21 3h-3.5L15.8.4c-.2-.2-.5-.4-.8-.4H9c-.3 0-.6.2-.8.4L6.5 3H3C1.3 3 0 4.3 0 6v11c0 1.7 1.3 3 3 3h18c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3zm1 14c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1h4c.3 0 .6-.2.8-.4L9.5 2h4.9l1.7 2.6c.3.2.6.4.9.4h4c.6 0 1 .4 1 1v11zM12 6c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z'
      />
    </defs>
    <use fill='currentColor' fillRule='nonzero' xlinkHref='#camera-svg' />
  </svg>
)

export default Camera
