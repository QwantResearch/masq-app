import { createElement } from 'react'
import PropTypes from 'prop-types'

import * as icons from './icons'

const Icon = (props) => createElement(icons[props.name], props)

Icon.propTypes = {
  name: PropTypes.oneOf([
    'Camera',
    'Cards',
    'Check',
    'List',
    'Logout',
    'Paperclip',
    'Phone',
    'Qrcode',
    'Rename',
    'Settings',
    'Trash'
  ])
}

export default Icon
