import React from 'react'
import { storiesOf } from '@storybook/react'

import { Typography } from '../src/components'

Typography.displayName = 'Typography'

storiesOf('Typography', module)
  .addParameters({
    info: 'Typography'
  })
  .add('titleModal', () => (
    <Typography type='title-modal'>Title modal</Typography>
  ))
  .add('title', () => (
    <Typography type='title' color='grey'>Title</Typography>
  ))
  .add('paragraph', () => (
    <Typography type='paragraph'>Text</Typography>
  ))
  .add('paragraph-modal', () => (
    <Typography type='paragraph-modal'>Text</Typography>
  ))
  .add('username', () => (
    <Typography type='username' color='grey'>Username</Typography>
  ))
  .add('label', () => (
    <Typography type='label'>Label</Typography>
  ))
  .add('label-nav', () => (
    <Typography type='label-nav'>Label nav</Typography>
  ))
