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
      label='primary button'
      onClick={action('onClick')}
    />
  ))
  .add('with custom color (no translation)', () => (
    <Button
      label='primary button'
      color='#40ae6c'
      onClick={action('onClick')}
    />
  ))
  .add('secondary', () => (
    <Button
      secondary
      label='secondary button'
      onClick={action('onClick')}
    />
  ))
