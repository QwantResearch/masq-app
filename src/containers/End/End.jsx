import React from 'react'
import { useTranslation } from 'react-i18next'

import styles from './End.module.scss'

import { ReactComponent as Logo } from '../../assets/logo-colored.svg'

const { REACT_APP_ALERT_DATE: masqAlertDate } = process.env

const End = () => {
  const { t } = useTranslation()

  return (
    <div className={styles.End}>
      <aside className={styles.Logo}>
        <Logo />
      </aside>

      <div style={{ maxWidth: 800 }}>
        <div className={styles.header}>
          <div>
            <p className={styles.title}>{`${t('Masq by Qwant will be disabled from')} ${(new Date(masqAlertDate)).toLocaleDateString()}.`}</p>
            <p className={styles.paragraph}>{t('From this date, access to Masq features and locations stored on your devices connected to your Masq will no longer be accessible.')}</p>
          </div>
        </div>

        <div className={styles.content}>
          <p className={styles.paragraphLight}>{t('Masq by Qwant has been released in alpha version to allow you to test this innovation in the field of online service personalization, with data encrypted and stored locally on the user\'s device.')}</p>
          <p className={styles.paragraphLight}>
            {t('After several months of testing, Qwant has decided to suspend Masq because it doesn\'t meet the expectations of most of you. The technology developed by Qwant is shared under a free license on our repository and can be reused by anyone who wants to take advantage of it or improve it. Qwant will of course continue to invest in solutions that protect the privacy of its users.')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default End
