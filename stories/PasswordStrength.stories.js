import React from 'react'
import { storiesOf } from '@storybook/react'

import { PasswordStrength } from '../src/components'

storiesOf('PasswordStrength', module)
  .addParameters({
    info: 'A Card can contain two children: actions displayed in the top right corner, and a footer.'
  })
  .add('an empty password', () => (
    <PasswordStrength password='' />
  ))
  .add('a password with only lowercases: ag', () => (
    <PasswordStrength password='ag' />
  ))
  .add('a password with also an uppercase : agzE', () => (
    <PasswordStrength password='agzE' />
  ))
  .add('a password with also a number : agzE28', () => (
    <PasswordStrength password='agzE28' />
  ))
  .add('a password with also a special character : agzE28#', () => (
    <PasswordStrength password='agzE28#' />
  ))
  .add('a password like : agtyzE28#58956', () => (
    <PasswordStrength password='agtyzE28#58956' />
  ))
