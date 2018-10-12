import React from 'react'
import { Sidebar } from 'qwant-research-components'
import { Avatar } from '../../components'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import cx from 'classnames'

import { signout } from '../../actions'

import styles from './Sidebar.module.scss'
import { ReactComponent as AppsIcon } from '../../assets/cards.svg'
import { ReactComponent as PhoneIcon } from '../../assets/phone.svg'
import { ReactComponent as SettingsIcon } from '../../assets/settings.svg'
import { ReactComponent as LogoutIcon } from '../../assets/logout.svg'

const Apps = ({ user, signout, ...props }) => {
  const path = props.location.pathname

  if (!user) return <Redirect to='/' />

  return (
    <Sidebar>
      <div className={styles.header}>
        <Avatar {...user} size={64} />
        <h2>{user.username}</h2>
      </div>
      <div className={styles.nav}>
        <Link to='/devices' className={cx(styles.navElement, { [styles.active]: path === '/devices' })}>
          <PhoneIcon fill='white' opacity={0.8} />
          <p className='label'>Appareils</p>
        </Link>
        <Link to='/apps' className={cx(styles.navElement, { [styles.active]: path === '/apps' })}>
          <AppsIcon fill='white' opacity={0.8} />
          <p className='label'>Applications</p>
        </Link>
        <Link to='/settings' className={cx(styles.navElement, { [styles.active]: path === '/settings' })}>
          <SettingsIcon fill='white' opacity={0.8} />
          <p className='label'>Paramètres</p>
        </Link>
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
