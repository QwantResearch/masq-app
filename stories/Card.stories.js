import React from 'react'
import { storiesOf } from '@storybook/react'

import { Card, Switch, Typography } from '../src/components'

const Actions = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <Switch color='#a3005c' label='Enabled' checked />
    <div style={{ marginRight: 16 }} />
  </div>
)

const Footer = () => (
  <Typography type='label' color='#697496'>Footer</Typography>
)

Actions.displayName = 'Actions'
Footer.displayName = 'Footer'

storiesOf('Card', module)
  .addParameters({
    info: 'A Card can contain two children: actions displayed in the top right corner, and a footer.'
  })
  .add('with title and description', () => (
    <Card
      color='#a3005c'
      title='Title'
      description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'
    />
  ))
  .add('with image', () => (
    <Card
      image='https://raw.githubusercontent.com/QwantResearch/erdapfel/master/public/images/qwant_logo_og.png'
      color='#a3005c'
      title='Title'
      description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'
      footer={<Footer />}
    />
  ))
  .add('with actions and a footer', () => (
    <Card
      image='http://oswallpapers.com/wp-content/uploads/2018/05/f28.png'
      color='#a3005c'
      title='Title'
      description='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'
      actions={<Actions />}
      footer={<Footer />}
    />
  ))
