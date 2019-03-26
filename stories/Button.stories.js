import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import { Button } from '../src/components'

Button.displayName = 'Button'

storiesOf('Button', module)
  .addParameters({
    info: 'A button of type primary (default) or secondary.'
  })
  .add('primary', () => (
    <Button
      color='primary'
      onClick={action('onClick')}
    >
      Primary
    </Button>
  ))
  .add('success', () => (
    <Button
      color='success'
      onClick={action('onClick')}
    >
      Success
    </Button>
  ))
  .add('danger', () => (
    <Button
      color='danger'
      onClick={action('onClick')}
    >
      Danger
    </Button>
  ))
  .add('neutral', () => (
    <Button
      color='neutral'
      onClick={action('onClick')}
    >
      Neutral
    </Button>
  ))
  .add('secondary', () => (
    <Button
      secondary
      onClick={action('onClick')}
    >
      Secondary
    </Button>
  ))
