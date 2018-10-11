import React from 'react'
import { storiesOf } from '@storybook/react'

import Avatar from './Avatar'

storiesOf('Avatar', module)
  .add('without upload and with image', () => (
    <Avatar image='https://randomuser.me/api/portraits/women/79.jpg' />
  ))
  .add('without upload without image', () => (
    <Avatar user={{firstname: 'John', lastname: 'Doe'}} />
  ))
  .add('with upload and without image', () => (
    <Avatar upload />
  ))
  .add('with upload and with image', () => (
    <Avatar upload image='https://randomuser.me/api/portraits/women/79.jpg' />
  ))
