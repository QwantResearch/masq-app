import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'

import styles from './PasswordStrength.module.scss'
import { Shield, Lock, Unlock, CheckCircle } from 'react-feather'
const { getPasswordInfo, getForce } = require('../../library/validators')

const NonChecked = () => (
  <div className={styles.Oval} />
)

const Description = ({ description }) => (
  <div className={styles.Description}>
    {description}
  </div>
)

Description.propTypes = {
  description: PropTypes.string
}
Description.defaultProps = {
  description: 'Pour être complètement sécurisée, la clé devrait contenir au moins :'
}

const Item = ({ fulfilled, text }) => {
  let printedRule = null
  switch (text) {
    case 'lowercase':
      printedRule = '1 minuscule'
      break
    case 'uppercase':
      printedRule = '1 majuscule'
      break
    case 'number':
      printedRule = '1 chiffre'
      break
    case 'specialCharacter':
      printedRule = '1 caractère spécial (!?$#@...)'
      break
    case 'secureLength':
      printedRule = '12 caractères'
      break
    default:
      break
  }
  const Icon = fulfilled
    ? <CheckCircle width={12} color='#308251' />
    : <NonChecked />
  return (
    <div className={styles.ItemFlex}>
      {Icon}
      <div className={styles.textItem}>
        {printedRule}
      </div>
    </div>
  )
}

Item.propTypes = {
  fulfilled: PropTypes.bool.isRequired,
  text: PropTypes.oneOf([
    'lowercase',
    'uppercase',
    'number',
    'specialCharacter',
    'secureLength'
  ])
}

const ForceBar = ({ force }) => {
  return (
    <div className={styles.Force}>
      <div className={styles.Rectangle}>
        <div className={cx(styles.RectangleForce, styles[`Force-${force}`])} />
      </div>
      <div className={styles.LabelForce}>
        {'Force'}
      </div>
    </div>

  )
}

ForceBar.propTypes = {
  force: PropTypes.oneOf([
    0,
    1,
    2,
    3,
    4,
    5
  ])
}
ForceBar.defaultProps = {
  force: 0
}
const PasswordRules = ({ force, passwordInfo }) => {
  const lockIcon = force > 1
    ? <Unlock
      size={30}
      className={cx(styles.lockIcon, styles[`force-${force}`])}
    />
    : <Lock
      size={30}
      className={cx(styles.lockIcon, styles[`force-${force}`])}
    />
  return (
    <div className={styles.PasswordRules}>
      <ul>
        {Object.keys(passwordInfo).filter(elt => elt !== 'force').map(elt => {
          return (
            <Item
              key={elt}
              fulfilled={passwordInfo[elt]}
              text={elt}
            />)
        })}
      </ul>
      <div className={styles.icon}>
        <Shield
          size={79}
          className={styles[`force-${force}`]}
        />
        {lockIcon}
      </div>
    </div>

  )
}

PasswordRules.propTypes = {
  passwordInfo: PropTypes.object,
  force: PropTypes.oneOf([
    0,
    1,
    2,
    3,
    4,
    5
  ])
}

const PasswordStrength = ({ password }) => {
  const passwordInfo = getPasswordInfo(password)
  const force = getForce(password)
  return (
    <div className={styles.PasswordStrength}>
      <ForceBar force={force} />
      <Description />
      <PasswordRules force={force} passwordInfo={passwordInfo} />
    </div>
  )
}

PasswordStrength.defaultProps = {
  password: ''
}

PasswordStrength.propTypes = {
  password: PropTypes.string.isRequired
}

export default PasswordStrength
