import React from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import Head from '../../assets/head-landing.svg'
import BGLanding from '../../assets/bg-landing.svg'

import { ReactComponent as Logo } from '../../assets/logo.svg'
import { ReactComponent as Box } from '../../assets/box.svg'
import { ReactComponent as HDD } from '../../assets/hard-disk.svg'
import { ReactComponent as Devices } from '../../assets/devices.svg'
import { ReactComponent as Shield } from '../../assets/shield.svg'
import { ReactComponent as Windows } from '../../assets/windows-masq.svg'
import { ReactComponent as Qwant } from '../../assets/qwant.svg'

import { Button, Space, Typography } from '../../components'

import styles from './Landing.module.scss'

// const remoteWebRTCEnabled = (process.env.REACT_APP_REMOTE_WEBRTC === 'true')

const Landing = ({ onClick, children }) => {
  const { t } = useTranslation()

  return (
    <div className={styles.Landing}>
      <div className={styles.section1} style={{ backgroundImage: `url(${Head})` }}>
        <div className={styles.Logo}><Logo /></div>
        {/* {remoteWebRTCEnabled && <div className={styles.connectBtn}><Button width={185}>Connexion</Button></div>} */}
        <Space size={74} />

        {children || (
          <div>
            <div className={styles.title}>
              <p>{t('Masq is a FREE and SECURED storage service on your devices')}</p>
            </div>
            <Space size={42} />
            <div className={styles.accountBtn}>
              <Button width={340} color='success' onClick={onClick}>Créer un profil</Button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section2}>
        <div className={styles.Box}>
          <div className={styles.text}>
            <Typography type='title-landing'>Le respect de la vie privée</Typography>
            <Space size={32} />
            <Typography type='paragraph-landing'>
            Masq vous permet de stocker les données personnelles de vos applications tout en garantissant le respect de votre vie privée.
            </Typography>
          </div>
          <Box />
        </div>

        <div className={styles.Hdd}>
          <HDD />
          <div className={styles.text}>
            <Typography type='title-landing'>Le stockage des données sur vos appareils</Typography>
            <Space size={32} />
            <Typography type='paragraph-landing'>
            Contrairement à la plupart des applications, vos données personnelles sont stockées directement sur les disques durs de vos appareils. Vous les gardez chez vous, vous êtes propriétaire de vos données.
            </Typography>
          </div>
        </div>

        <Space size={95} />

        <div className={styles.Devices}>
          <div className={styles.text}>
            <Typography type='title-landing'>La synchronisation entre appareils en temps réel (bientôt)</Typography>
            <Space size={32} />
            <Typography type='paragraph-landing'>
            Retrouvez vos lieux préférés issus de Qwant Maps, votre historique de recherche de Qwant Search, vos playslists de Qwant Music ... disponibles depuis tous vos appareils avec une synchronisation en temps réel!
            </Typography>
          </div>
          <Devices />
        </div>
      </div>

      <div className={styles.section3} style={{ backgroundImage: `url(${BGLanding})` }}>

        <div className={styles.title}>
          <Typography type='title-landing2'>
            Les bonnes pratiques Masq pour une utilisation optimale
          </Typography>
        </div>

        <Space size={62} />

        <div className={styles.Shield}>
          <Shield />
          <div className={styles.text}>
            <Typography type='title-landing'>Votre clé secrète est connue de vous seul, nous n'y avons jamais accès .</Typography>
            <Space size={32} />
            <Typography type='paragraph-landing-dark'>
              Vos données sont chiffrées et déchiffrées au niveau local. Ainsi votre mot de passe (clé secrète), n’est jamais envoyé vers nos serveurs et nous n'y avons jamais accès.
            </Typography>
          </div>
        </div>

        <Space size={100} />

        <div className={styles.Windows}>
          <div className={styles.text}>
            <Typography type='title-landing'>Laisser la fenêtre Masq en arrière-plan pour synchroniser vos données (bientôt)</Typography>
            <Space size={32} />
            <Typography type='paragraph-landing-dark'>
            Afin de profiter un maximum de la synchronisation en temps réel et d'avoir toujours vos données à jour, il est nécessaire de laisser l'application Masq en arrière-plan sur tous vos appareils.
            </Typography>
          </div>
          <Windows />
        </div>
      </div>

      <div className={styles.Footer}>
        <Qwant />
        <div className={styles.links}>
          <a href='mailto:masq.dev@qwant.com'>
            <Typography type='footer'>Contactez-nous</Typography>
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
