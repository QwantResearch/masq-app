import React from 'react'
import { storiesOf } from '@storybook/react'

import Icon from './Icon'

Icon.displayName = 'Icon'

const styles = {
  container: {
    display: 'flex'
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 16,
    justifyContent: 'space-between'
  }
}

const icons = [
  'Camera',
  'Cards',
  'Check',
  'Close',
  'List',
  'Logout',
  'Paperclip',
  'Phone',
  'Qrcode',
  'Rename',
  'Trash',
  'Settings'
]

storiesOf('Icon', module)
  .addParameters({
    info: 'Icons'
  })
  .add('icons list', () => (
    <div style={styles.container}>
      {icons.map(icon =>
        <div style={styles.item}>
          <Icon name={icon} />
          <label>{icon}</label>
        </div>
      )}
    </div>
  ))
  .add('with a filling color', () => (
    <Icon name='Qrcode' fill='blue' />
  ))
