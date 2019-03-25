import React from 'react'
import { storiesOf } from '@storybook/react'

import { Avatar } from '../src/components'

Avatar.displayName = 'Avatar'

storiesOf('Avatar', module)
  .add('with an image', () => (
    <Avatar image='http://oswallpapers.com/wp-content/uploads/2018/05/f28.png' />
  ))
  .add('with upload', () => (
    <Avatar upload image='http://oswallpapers.com/wp-content/uploads/2018/05/f28.png' />
  ))
  .add('with custom size', () => (
    <Avatar size={240} image='http://oswallpapers.com/wp-content/uploads/2018/05/f28.png' />
  ))
