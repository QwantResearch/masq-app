import React from 'react'
import { storiesOf } from '@storybook/react'

import { Avatar } from '../src/components'

Avatar.displayName = 'Avatar'

storiesOf('Avatar', module)
  .add('without image', () => (
    <Avatar />
  ))
  .add('with an image', () => (
    <Avatar username='John Doe' image='http://oswallpapers.com/wp-content/uploads/2018/05/f28.png' />
  ))
  .add('with upload', () => (
    <Avatar username='John Doe' upload image='http://oswallpapers.com/wp-content/uploads/2018/05/f28.png' />
  ))
  .add('with custom size', () => (
    <Avatar username='John Doe' size={240} upload image='http://oswallpapers.com/wp-content/uploads/2018/05/f28.png' />
  ))
  .add('default avatars based on username', () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
      <Avatar username='John Doe' upload />
      <Avatar username='yeah' upload />
      <Avatar username='Eddie' upload />
      <Avatar username='Arya' upload />
      <Avatar username='Lana' upload />
      <Avatar username='Baloo' upload />
    </div>
  ))
