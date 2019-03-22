import React from 'react'

const Qrcode = props => (
  <svg width={24} height={24} {...props}>
    <path d='M0 0v7h7V0H0zm5 5H2V2h3v3zM0 17h7v7H0v-7zm5 5v-3H2v3h3zM17 0h7v7h-7V0zm5 5V2h-3v3h3zm0 4h2v8h-7v-2h5V9zm-5 10h7v5h-2v-3h-3v3h-2v-5zM9 0h6v7h-2V2H9V0zm4 9h6v4h-2v-2h-2v4h-4v2h4v7h-2v-5H9v-6h4V9zM9 21h2v3H9v-3zm-5-8h3v2H4v-2zm5-9h2v7H2v4H0V9h9V4z' />
  </svg>
)

export default Qrcode
