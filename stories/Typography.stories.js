import React from 'react'
import { storiesOf } from '@storybook/react'

import { Typography } from '../src/components'

Typography.displayName = 'Typography'

storiesOf('Typography', module)
  .addParameters({
    info: 'Typography'
  })
  .add('title', () => (
    <Typography type='title' color='black'>Title</Typography>
  ))
  .add('label', () => (
    <Typography type='label' color='black'>Label</Typography>
  ))
  .add('text', () => (
    <Typography type='text' color='black'>Text</Typography>
  ))
