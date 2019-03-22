import React from 'react'
import { storiesOf } from '@storybook/react'

import { CircleIndicator } from '../src/components'

CircleIndicator.displayName = 'CircleIndicator'

storiesOf('CircleIndicator', module)
  .addParameters({
    info: 'A simple colored circle to indicate a status'
  })
  .add('circleIndicator', () => (
    <CircleIndicator color='#458bf8' />
  ))
