import React from 'react'

import { ReactComponent as Cubes } from '../../assets/cubes.svg'
import { ReactComponent as Logo } from '../../assets/logo.svg'
import { Space, Typography } from '../../components'
import video from '../../assets/masq_loading.mp4'

import styles from './Loading.module.scss'

const Loading = () => (
  <div className={styles.Login}>
    <div className={styles.content}>
      <Space size={68} />
      <Logo />
      <Space size={82} />
    </div>
    <video autoPlay loop src={video} />
    <Typography type='paragraph-landing'>Chargement en cours</Typography>
    <Cubes className={styles.Background} />
  </div>
)

export default Loading
