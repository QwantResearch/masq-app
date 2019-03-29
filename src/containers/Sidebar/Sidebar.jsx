import React, { Fragment } from 'react'
import MediaQuery from 'react-responsive'

import SidebarMin from './SidebarMin'
import SidebarMax from './SidebarMax'

const Sidebar = (props) => (
  <Fragment>
    <MediaQuery maxWidth={1023}>
      <SidebarMin {...props} />
    </MediaQuery>
    <MediaQuery minWidth={1024}>
      <SidebarMax {...props} />
    </MediaQuery>
  </Fragment>
)

export default Sidebar
