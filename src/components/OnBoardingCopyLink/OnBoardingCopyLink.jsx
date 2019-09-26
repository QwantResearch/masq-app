import React from 'react'
import PropTypes from 'prop-types'
import { OnBoarding } from '..'

import { useTranslation } from 'react-i18next'

import animation1 from '../../assets/onBoarding/OnboardingQrCode_Slide1.gif'
import animation2 from '../../assets/onBoarding/OnboardingQrCode_Slide2.gif'
import animation3 from '../../assets/onBoarding/OnboardingCopyLink_Slide3.gif'

const OnBoardingCopyLink = ({ onClose }) => {
  const { t } = useTranslation()
  const slidesContentCopyLink = [
    {
      title: t('How to find the profile link?'),
      image: animation1,
      text: t('Log in to Masq from the device on which you already have a profile')
    },
    {
      title: t('How to find the profile link?'),
      image: animation2,
      text: t('In the "Devices" section, click the "Add a device" button')
    },
    {
      title: t('How to find the profile link?'),
      image: animation3,
      text: t('Copy the link displayed on your original device, then paste it in the "existing profile link" field on this device.')
    }
  ]
  return (
    <OnBoarding
      width={337}
      height={480}
      onClose={onClose}
      slidesContent={slidesContentCopyLink}
    />)
}

OnBoardingCopyLink.propTypes = {
  onClose: PropTypes.func
}

export default OnBoardingCopyLink
