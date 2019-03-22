import React, { Component } from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import PropTypes from 'prop-types'

import { Switch } from '../src/components/'

Switch.displayName = 'Switch'

const COLOR_OFF = '#c8cbd3'
const COLOR_ON = '#40ae6c'

class SwitchExample extends Component {
  constructor (props) {
    super(props)
    this.state = {
      checked: false
    }
    this.getColor = this.getColor.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  getColor () {
    return this.state.checked ? COLOR_ON : COLOR_OFF
  }

  handleChange (e) {
    this.setState({
      checked: e.target.checked
    })
  }

  render () {
    return (
      <Switch
        secondary={this.props.secondary}
        checked={this.state.checked}
        onChange={this.handleChange}
        color={this.getColor()}
      />
    )
  }
}

SwitchExample.propTypes = {
  secondary: PropTypes.bool
}

storiesOf('Switch', module)
  .addParameters({
    info: 'Switch component of types primary or secondary, to toggle on/off.'
  })
  .add('on', () => (
    <Switch checked onChange={action('onChange')} color={COLOR_ON} label='on' />
  ))
  .add('off', () => (
    <Switch onChange={action('onChange')} color={COLOR_OFF} label='off' />
  ))
  .add('without label', () => (
    <Switch checked onChange={action('onChange')} color={COLOR_ON} />
  ))
  .add('secondary on', () => (
    <Switch secondary checked onChange={action('onChange')} color={COLOR_ON} />
  ))
  .add('secondary off', () => (
    <Switch secondary onChange={action('onChange')} color={COLOR_OFF} />
  ))
  .add('on / off (example)', () => (
    <SwitchExample />
  ))
  .add('on / off secondary (example)', () => (
    <SwitchExample secondary />
  ))
