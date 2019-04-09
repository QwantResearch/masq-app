import React, { Fragment } from 'react'
import MediaQuery from 'react-responsive'

import NavbarMin from './NavbarMin'
import NavbarMax from './NavbarMax'

const Sidebar = (props) => (
  <Fragment>
    <MediaQuery maxWidth={1023}>
      <NavbarMin {...props} />
    </MediaQuery>
    <MediaQuery minWidth={1024}>
      <NavbarMax {...props} />
    </MediaQuery>
  </Fragment>
)

export default Sidebar
