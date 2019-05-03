import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Eye } from 'react-feather'

import { TextField, Typography } from '../src/components'

TextField.displayName = 'TextField'

storiesOf('TextField', module)
  .addParameters({
    info: 'A TextField with a label, which can be either idle, focused, or in an error state.'
  })
  .add('default', () => (
    <TextField
      label='name'
      onChange={action('onChange')}
    />
  ))
  .add('error', () => (
    <TextField
      label='name is incorrect'
      error
      onChange={action('onChange')}
    />
  ))
  .add('password field', () => (
    <TextField
      password
      label='Password'
      type='password'
      button={() => <Eye />}
      onChange={action('onChange')}
    />
  ))
  .add('with a button', () => (
    <TextField
      label='Password'
      onChange={action('onChange')}
      button='Edit'
      onClick={action('onClick')}
    />
  ))
