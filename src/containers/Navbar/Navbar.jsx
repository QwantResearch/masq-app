import React, { Fragment } from 'react'
import MediaQuery from 'react-responsive'

import NavbarMin from './NavbarMin'
import NavbarMax from './NavbarMax'
import NavBarMobile from './NavbarMobile'

const Navbar = (props) => {
  return (
    <Fragment>
      <MediaQuery maxWidth={700}>
        <NavBarMobile {...props} />
      </MediaQuery>
      <MediaQuery minWidth={701} maxWidth={1109}>
        <NavbarMin {...props} />
      </MediaQuery>
      <MediaQuery minWidth={1110}>
        <NavbarMax {...props} />
      </MediaQuery>
    </Fragment>
  )
}

export default Navbar
