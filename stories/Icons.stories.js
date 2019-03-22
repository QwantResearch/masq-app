import React from 'react'
import { storiesOf } from '@storybook/react'
import { Camera, Paperclip, Trash, Phone, Settings, Grid, List, LogOut } from 'react-feather'

storiesOf('Icons', module)
  .addParameters({
    info: 'Some icons from feather used across Masq'
  })
  .add('feather icons', () => (
    <div>
      <Paperclip />
      <Camera />
      <Trash />
      <Phone />
      <Settings />
      <Grid />
      <List />
      <LogOut />
    </div>
  ))
