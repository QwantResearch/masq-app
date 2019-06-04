import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReactComponent as Cubes } from '../../assets/cubes.svg'
import { ReactComponent as Logo } from '../../assets/logo.svg'
import { Space, Typography } from '../../components'
import animation from '../../assets/masq_loading.gif'

import styles from './Loading.module.scss'

const Loading = () => {
  const { t } = useTranslation()
  return (
    <div className={styles.Login}>
      <div className={styles.content}>
        <Space size={68} />
        <Logo />
        <Space size={82} />
      </div>
      <img src={animation} />
      <Typography type='paragraph-landing'>{t('Loading...')}</Typography>
      <Cubes className={styles.Background} />
    </div>
  )
}

export default Loading
