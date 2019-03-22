import React from 'react'

import styles from './Loader.module.scss'

const Loader = () => (
  <div className={styles.Loader}>
    <div className={styles.dot} />
    <div className={styles.dot} />
    <div className={styles.dot} />
  </div>
)

export default Loader
