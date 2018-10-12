import React from 'react'
import { Sidebar } from 'qwant-research-components'
import { Avatar } from '../../components'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'

import { signout } from '../../actions'

import styles from './Apps.module.scss'
import { ReactComponent as AppsIcon } from '../../assets/cards.svg'
import { ReactComponent as PhoneIcon } from '../../assets/phone.svg'
import { ReactComponent as SettingsIcon } from '../../assets/settings.svg'
import { ReactComponent as LogoutIcon } from '../../assets/logout.svg'

const Apps = ({ user, signout }) => {
  if (!user) return <Redirect to='/' />

  return (
    <Sidebar>
      <div className={styles.header}>
        <Avatar {...user} size={64} />
        <h2>{user.username}</h2>
      </div>
      <div className={styles.nav}>
        <div className={styles.navElement}>
          <PhoneIcon fill='white' opacity={0.8} />
          <p className='label'>Appareils</p>
        </div>
        <div className={styles.navElement}>
          <AppsIcon fill='white' opacity={0.8} />
          <p className='label'>Applications</p>
        </div>
        <div className={styles.navElement}>
          <SettingsIcon fill='white' opacity={0.8} />
          <p className='label'>Paramètres</p>
        </div>
      </div>
      <div className={styles.logout} onClick={signout}>
        <Link to='/' className={styles.navElement}>
          <LogoutIcon fill='white' opacity={0.8} />
          <p className='label'>Déconnexion</p>
        </Link>
      </div>
    </Sidebar>
  )
}

const mapStateToProps = (state) => ({
  user: state.masq.currentUser
})

const mapDispatchToProps = dispatch => ({
  signout: user => dispatch(signout(user))
})

export default connect(mapStateToProps, mapDispatchToProps)(Apps)
