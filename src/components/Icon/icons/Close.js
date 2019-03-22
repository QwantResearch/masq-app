import React from 'react'

const Close = props => (
  <svg
    xmlnsXlink='http://www.w3.org/1999/xlink'
    width={14}
    height={14}
    viewBox='0 0 14 14'
    {...props}
  >
    <defs>
      <path
        id='close-svg'
        d='M13.7 12.3c.4.4.4 1 0 1.4-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3L7 8.4l-5.3 5.3c-.2.2-.4.3-.7.3-.3 0-.5-.1-.7-.3-.4-.4-.4-1 0-1.4L5.6 7 .3 1.7C-.1 1.3-.1.7.3.3c.4-.4 1-.4 1.4 0L7 5.6 12.3.3c.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4L8.4 7l5.3 5.3z'
      />
    </defs>
    <use fill='currentColor' fillRule='nonzero' xlinkHref='#close-svg' />
  </svg>
)

export default Close
