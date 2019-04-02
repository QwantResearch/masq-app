import React from 'react'
import { storiesOf } from '@storybook/react'

import { Landing } from '../src/containers'

Landing.displayName = 'Landing'

storiesOf('Landing', module)
  .add('landing', () => (
    <div style={{ margin: 0, padding: 0 }}>
      <Landing />
    </div>
  ))
