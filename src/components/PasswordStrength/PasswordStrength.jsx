import React, { useState } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import MediaQuery from 'react-responsive'
import { useTranslation } from 'react-i18next'
import styles from './PasswordStrength.module.scss'
import { Shield, Lock, Unlock, CheckCircle, Info } from 'react-feather'
const { getPasswordInfo, getForce } = require('../../lib/validators')
const NonChecked = () => (
  <div className={styles.Oval} />
)

const Description = () => {
  const { t } = useTranslation()
  return (
    <div className={styles.Description}>
      {t('To be completely secure, the key must contain at least')}:
    </div>
  )
}

const InfoMessage = ({ top, left }) => {
  const { t } = useTranslation()
  return (
    <div className={styles.Bubble} style={{ top: top, left: left }}>
      <div className={styles.BubbleText}>
        {t('You can choose from')}{': ="!?$#%@()\\-_/@^+*&:<>{};~\'`.|[] '}
      </div>
    </div>

  )
}
InfoMessage.propTypes = {
  top: PropTypes.number.isRequired,
  left: PropTypes.number.isRequired
}

const InfoButton = () => {
  const [visible, setVisible] = useState(false)
  const handleClick = () => {
    setVisible(!visible)
  }

  const handleMouseLeave = () => {
    setVisible(false)
  }

  return (
    <div className={styles.InfoIcon}>
      <Info onMouseLeave={() => handleMouseLeave()} onClick={() => handleClick()} width={14} height={14} color='#353c52' />
      <MediaQuery maxWidth={700}>
        {visible && <InfoMessage top={16} left={-20} />}
      </MediaQuery>
      <MediaQuery minWidth={701}>
        {visible && <InfoMessage top={16} left={15} />}
      </MediaQuery>

    </div>
  )
}

const Item = ({ fulfilled, text }) => {
  const { t } = useTranslation()
  let printedRule = null
  switch (text) {
    case 'lowercase':
      printedRule = t('1 lowercase')
      break
    case 'uppercase':
      printedRule = t('1 uppercase')
      break
    case 'number':
      printedRule = t('1 number')
      break
    case 'specialCharacter':
      printedRule = t('1 special character ')
      break
    case 'secureLength':
      printedRule = t('12 characters')
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
        {text === 'specialCharacter' && <InfoButton />}
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
    ? (
      <Lock
        size={30}
        className={cx(styles.lockIcon, styles[`force-${force}`])}
      />
    )
    : (
      <Unlock
        size={30}
        className={cx(styles.lockIcon, styles[`force-${force}`])}
      />
    )
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
      <PasswordRules force={force} passwordInfo={passwordInfo} t />
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
