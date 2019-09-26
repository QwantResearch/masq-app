import React from 'react'
import PropTypes from 'prop-types'
import { OnBoarding } from '../../components'

import { useTranslation } from 'react-i18next'
import animation1 from '../../assets/onBoarding/OnboardingQrCode_Slide1.gif'
import animation2 from '../../assets/onBoarding/OnboardingQrCode_Slide2.gif'
import animation3 from '../../assets/onBoarding/OnboardingQrCode_Slide3.gif'

const OnBoardingQrCode = ({ onClose }) => {
  const { t } = useTranslation()
  const slidesContentQrCode = [
    {
      title: t('How to display the QR code of my profile?'),
      image: animation1,
      text: t('Log in to Masq from the device on which you already have a profile')
    },
    {
      title: t('How to display the QR code of my profile?'),
      image: animation2,
      text: t('In the "Devices" section, click the "Add a device" button')
    },
    {
      title: t('How to display the QR code of my profile?'),
      image: animation3,
      text: t('Using the new device, scan the QR code displayed on the original device')
    }
  ]
  return (
    <OnBoarding
      width={337}
      height={480}
      onClose={onClose}
      slidesContent={slidesContentQrCode}
    />)
}

OnBoardingQrCode.propTypes = {
  onClose: PropTypes.func
}

export default OnBoardingQrCode
