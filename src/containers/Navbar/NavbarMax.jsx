import React from 'react'
import { connect } from 'react-redux'
import { Redirect, NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Grid, Smartphone, Settings, LogOut } from 'react-feather'
import { withTranslation } from 'react-i18next'

import { Avatar, Space, Typography } from '../../components'
import { signout } from '../../actions'
import { ReactComponent as Cubes } from '../../assets/cubes-sidebar.svg'
import { ReactComponent as Logo } from '../../assets/logo-sidebar.svg'

import styles from './NavbarMax.module.scss'

class NavbarMax extends React.Component {
  render () {
    const { user, signout, t } = this.props

    if (!user) return <Redirect to='/' />

    return (
      <div className={styles.Sidebar}>
        <div className={styles.header}>
          <Logo />
          <Space size={22} />
          <Avatar {...user} size={54} />
          <Space size={8} />
          <Typography id='navbar-username-output' type='username'>{user.username}</Typography>
        </div>
        <div className={styles.nav}>
          <NavLink to='/apps' className={styles.navElement} activeClassName={styles.active}>
            <Grid opacity={0.8} width={24} />
            <Typography type='label-nav'>{t('Applications')}</Typography>
          </NavLink>
          <NavLink to='/devices' className={styles.navElement} activeClassName={styles.active}>
            <Smartphone opacity={0.8} width={24} />
            <Typography type='label-nav'>{t('Devices')}</Typography>
          </NavLink>
          <NavLink to='/settings' className={styles.navElement} activeClassName={styles.active}>
            <Settings opacity={0.8} width={24} />
            <Typography type='label-nav'>{t('Settings')}</Typography>
          </NavLink>
        </div>
        <div className={styles.logout} onClick={signout}>
          <div className={styles.navElement}>
            <LogOut opacity={0.8} width={24} />
            <Typography type='label-nav'>{t('Sign out')}</Typography>
          </div>
        </div>
        <Cubes className={styles.cubes} />
      </div>
    )
  }
}

NavbarMax.propTypes = {
  user: PropTypes.object,
  signout: PropTypes.func,
  t: PropTypes.func
}

const mapStateToProps = (state) => ({
  user: state.masq.currentUser
})

const mapDispatchToProps = dispatch => ({
  signout: () => dispatch(signout())
})

const translatedNavbarMax = withTranslation()(NavbarMax)
export default connect(mapStateToProps, mapDispatchToProps)(translatedNavbarMax)
