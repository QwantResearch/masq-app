import React from 'react'
import { storiesOf } from '@storybook/react'

import { Loader } from '../src/components'

Loader.displayName = 'Loader'

storiesOf('Loader', module)
  .addParameters({
    info: 'A Loader to show that an operation is in progress.'
  })
  .add('default', () => (
    <Loader />
  ))
