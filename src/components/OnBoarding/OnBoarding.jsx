import React from 'react'
import PropTypes from 'prop-types'
import MediaQuery from 'react-responsive'

import { X, ChevronRight, ChevronLeft, Circle } from 'react-feather'
import { Button, Typography, Space } from '../../components'
import { withTranslation } from 'react-i18next'

import styles from './OnBoarding.module.scss'

const Bullet = ({ isActive }) => <div className={isActive ? styles.bulletActive : styles.bulletNotActive} />
Bullet.propTypes = {
  isActive: PropTypes.bool
}

const Bullets = ({ curStep, totalSteps }) => {
  return (
    <div className={styles.bullets}>
      {[...Array(totalSteps).keys()].map(elt => {
        return (elt === curStep
          ? <Bullet key={elt} isActive />
          : <Bullet key={elt} isActive={false} />)
      })}
    </div>
  )
}
Bullets.propTypes = {
  curStep: PropTypes.number,
  totalSteps: PropTypes.number
}

const Previous = ({ firstStep, onPrevious }) => (
  <div onClick={onPrevious} className={firstStep ? styles.hidden : styles.previous}>
    <Circle strokeWidth={1} size={35} />
    <div className={styles.chevronLeft}>
      <ChevronLeft strokeWidth={2} size={22} />
    </div>
  </div>

)
Previous.propTypes = {
  onPrevious: PropTypes.func,
  firstStep: PropTypes.bool
}

const Next = ({ lastStep, onNext }) => (
  <div onClick={onNext} className={lastStep ? styles.hidden : styles.next}>
    <Circle strokeWidth={1} size={35} />
    <div className={styles.chevronRight}>
      <ChevronRight strokeWidth={2} size={22} />
    </div>
  </div>
)
Next.propTypes = {
  onNext: PropTypes.func,
  lastStep: PropTypes.bool
}

const Slide = ({ curStep, totalSteps, onNext, onPrevious, lastStep, image }) => {
  const firstStep = curStep === 0 || totalSteps === 1
  return (
    <div className={styles.slide}>
      {<Previous firstStep={firstStep} onPrevious={onPrevious} />}
      <img width={250} src={image} alt='slide' />
      {<Next lastStep={lastStep} onNext={onNext} />}
    </div>
  )
}
Slide.propTypes = {
  image: PropTypes.string,
  lastStep: PropTypes.bool,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
  curStep: PropTypes.number,
  totalSteps: PropTypes.number

}

const OnBoarding = ({ t, curStep, totalSteps, onClose, width, height, padding, children, onNext, onPrevious, slideContent }) => {
  const { title, image, text } = slideContent
  const lastStep = curStep === totalSteps - 1 || totalSteps === 1
  return (
    <div className={styles.OnBoarding}>
      <div className={styles.overlay} />
      <div
        className={styles.onBoarding}
        style={{
          width,
          height
        }}
      >
        <Space size={41} />
        <div className={styles.title}>
          <Typography type='title-onboarding'>{title} </Typography>
        </div>
        <Space size={40} />
        <Slide
          image={image}
          onNext={onNext}
          onPrevious={onPrevious}
          lastStep={lastStep}
          curStep={curStep}
          totalSteps={totalSteps}
        />
        <Space size={23} />
        <div className={styles.text}>
          <Typography type='paragraph-onboarding'>{text} </Typography>
        </div>
        <Space size={23} />
        {<Bullets curStep={curStep} totalSteps={totalSteps} />}
        {onClose && <X className={styles.close} size={25} onClick={onClose} />}
        {children}
        <div className={styles.finishButon}>
          {lastStep && <Button classeName={styles.finish} color='primary' onClick={onClose}>{t('Okay, I get it!')}</Button>}
        </div>
      </div>
    </div>
  )
}

class ResponsiveOnBoarding extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      step: 0,
      firstStep: true
    }
    this.handleNext = this.handleNext.bind(this)
    this.handlePrevious = this.handlePrevious.bind(this)
  }

  handleNext () {
    this.setState({
      step: this.state.step += 1
    })
  }

  handlePrevious () {
    this.setState({
      step: this.state.step -= 1
    })
  }

  render () {
    const { width, height, onClose, children, padding, slidesContent, t } = this.props

    return (
      <div>
        <MediaQuery maxWidth={styles.mobileWidth}>
          <OnBoarding
            width='100%'
            slideContent={slidesContent[this.state.step]}
            onNext={this.handleNext}
            onPrevious={this.handlePrevious}
            curStep={this.state.step}
            totalSteps={slidesContent.length}
            onClose={onClose}
            children={children}
            t={t}
          />
        </MediaQuery>
        <MediaQuery minWidth={701}>
          <OnBoarding
            width={width}
            height={height}
            slideContent={slidesContent[this.state.step]}
            onNext={this.handleNext}
            onPrevious={this.handlePrevious}
            curStep={this.state.step}
            totalSteps={slidesContent.length}
            onClose={onClose}
            children={children}
            padding={padding}
            t={t}
          />
        </MediaQuery>
      </div>
    )
  }
}

OnBoarding.propTypes = {
  slideContent: PropTypes.object.isRequired,
  t: PropTypes.func,
  curStep: PropTypes.number,
  totalSteps: PropTypes.number,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
  onClose: PropTypes.func,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  padding: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  children: PropTypes.object

}

ResponsiveOnBoarding.propTypes = {
  onClose: PropTypes.func,
  children: PropTypes.object,
  t: PropTypes.func,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  padding: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  slidesContent: PropTypes.array.isRequired
}

const translatedResponsiveOnBoarding = withTranslation()(ResponsiveOnBoarding)
export default translatedResponsiveOnBoarding
