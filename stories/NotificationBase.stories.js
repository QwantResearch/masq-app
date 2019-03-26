import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import NotificationBase from '../src/components/Notification/NotificationBase.jsx'

NotificationBase.displayName = 'NotificationBase'

storiesOf('NotificationBase', module)
  .addParameters({
    info: 'Notification to alerts of success/error events.'
  })
  .add('default success', () => (
    <NotificationBase title='Success!' onClose={action('onClosed')} />
  ))
  .add('error', () => (
    <NotificationBase error title='Error!' onClose={action('onClosed')} />
  ))
