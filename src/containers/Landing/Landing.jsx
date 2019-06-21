import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import Head from '../../assets/head-landing.svg'
import HeadMobile from '../../assets/head-landing-mobile.svg'
import BGLanding from '../../assets/bg-landing.svg'

import { ReactComponent as Logo } from '../../assets/logo.svg'
import { ReactComponent as Box } from '../../assets/box.svg'
import { ReactComponent as HDD } from '../../assets/hard-disk.svg'
import { ReactComponent as Devices } from '../../assets/devices.svg'
import { ReactComponent as Shield } from '../../assets/shield.svg'
import { ReactComponent as Windows } from '../../assets/windows-masq.svg'
import { ReactComponent as Qwant } from '../../assets/qwant.svg'

import { Button, Space, Typography } from '../../components'
import { useWindowWidth } from '../../hooks'

import styles from './Landing.module.scss'

// const remoteWebRTCEnabled = (process.env.REACT_APP_REMOTE_WEBRTC === 'true')

const MOBILE_WIDTH = 700

const Landing = ({ onClick, children }) => {
  const { t } = useTranslation()
  const width = useWindowWidth()

  return (
    <div className={styles.Landing}>
      <div
        className={styles.section1}
        style={{ backgroundImage: `url(${width > MOBILE_WIDTH ? Head : HeadMobile})` }}
      >
        <div className={styles.Logo}><Logo /></div>
        {/* {remoteWebRTCEnabled && <div className={styles.connectBtn}><Button width={185}>Connexion</Button></div>} */}
        <Space size={74} />

        {children || (
          <div>
            <div className={styles.title}>
              <p>{t('Free and secured storage of your preferences and personal data on all your devices')}</p>
            </div>
            <Space size={42} />
            <div className={styles.accountBtn}>
              <Button width={340} color='success' onClick={onClick}>{t('Create a new profile')}</Button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section2}>
        <div className={styles.Box}>
          <div className={styles.text}>
            <Typography type='title-landing'>{t('Respects your privacy')}</Typography>
            <Typography type='paragraph-landing'>
              {t('Masq allows you to store all your preferences while guaranteeing your privacy')}
            </Typography>
          </div>
          <Box />
        </div>

        <div className={styles.Hdd}>
          <HDD />
          <div className={styles.text}>
            <Typography type='title-landing'>{t('Personal data is stored on your devices')}</Typography>
            <Typography type='paragraph-landing'>
              {t('No more need to Cloud ! Your preferences and personnal data are stored directly on your devices, they are encrypted to gurantee their security. You are the owner of your data')}
            </Typography>
          </div>
        </div>

        <div className={styles.Devices}>
          <div className={styles.text}>
            <Typography type='title-landing'>{t('Real time synchronization between devices (coming soon)')}</Typography>
            <Typography type='paragraph-landing'>
              {t('Synchronize soon your Masq profile between all your devices in real time without any storage server !')}
            </Typography>
          </div>
          <Devices />
        </div>
      </div>

      <div className={styles.section3} style={{ backgroundImage: `url(${BGLanding})` }}>

        <div className={styles.title}>
          <Typography type='title-landing2'>
            {t('Good practices of Masq for optimal use')}
          </Typography>
        </div>

        <div className={styles.Shield}>
          <Shield />
          <div className={styles.text}>
            <Typography type='title-landing'>{t('Your secret key is only known by YOU')}</Typography>
            <Typography type='paragraph-landing-dark'>
              {t('So, do not forget it :-); your data is encrypted and decrypted on your device. That is why your secret key is never sent to our servers, we never have acces to it')}
            </Typography>
          </div>
        </div>

        <div className={styles.Windows}>
          <div className={styles.text}>
            <Typography type='title-landing'>{t('Keep the Masq window in the background in order to allow data synchronization')}</Typography>
            <Typography type='paragraph-landing-dark'>
              {t('To benefit from real time synchronization and always have up-to-date data, keep the Masq window opened in the background on all your devices')}
            </Typography>
          </div>
          <Windows />
        </div>
      </div>

      <div className={styles.Footer}>
        <Qwant />
        <div className={styles.links}>
          <a href='https://github.com/QwantResearch/masq-app/' rel='noopener noreferrer' target='_blank'>
            <Typography type='footer'>GitHub</Typography>
          </a>
          <a href='mailto:masq.dev@qwant.com'>
            <Typography type='footer'>{t('Contact us')}</Typography>
          </a>
          <a href='https://help.qwant.com' rel='noopener noreferrer' target='_blank'>
            <Typography type='footer'>F.A.Q.</Typography>
          </a>
        </div>
      </div>
    </div>
  )
}

Landing.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.element
}

export default Landing
