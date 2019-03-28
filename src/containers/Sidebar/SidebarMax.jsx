import React from 'react'
import { connect } from 'react-redux'
import { Redirect, NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Grid, Smartphone, Settings, LogOut } from 'react-feather'

import { Avatar, Space, Typography } from '../../components'
import { signout } from '../../actions'
import { ReactComponent as Cubes } from '../../assets/cubes-sidebar.svg'
import { ReactComponent as Logo } from '../../assets/logo-sidebar.svg'

import styles from './SidebarMax.module.scss'

class SidebarMax extends React.Component {
  render () {
    const { user, signout } = this.props

    if (!user) return <Redirect to='/' />

    return (
      <div className={styles.Sidebar}>
        <div className={styles.header}>
          <Logo />
          <Space size={22} />
          <Avatar {...user} size={54} />
          <Space size={8} />
          <Typography type='username'>{user.username}</Typography>
        </div>
        <div className={styles.nav}>
          <NavLink to='/apps' className={styles.navElement} activeClassName={styles.active}>
            <Grid opacity={0.8} width={24} />
            <Typography type='label-nav'>Applications</Typography>
          </NavLink>
          <NavLink to='/devices' className={styles.navElement} activeClassName={styles.active}>
            <Smartphone opacity={0.8} width={24} />
            <Typography type='label-nav'>Appareils</Typography>
          </NavLink>
          <NavLink to='/settings' className={styles.navElement} activeClassName={styles.active}>
            <Settings opacity={0.8} width={24} />
            <Typography type='label-nav'>Paramètres</Typography>
          </NavLink>
        </div>
        <div className={styles.logout} onClick={signout}>
          <div className={styles.navElement}>
            <LogOut opacity={0.8} width={24} />
            <Typography type='label-nav'>Déconnexion</Typography>
          </div>
        </div>
        <Cubes className={styles.cubes} />
      </div>
    )
  }
}

SidebarMax.propTypes = {
  user: PropTypes.object,
  signout: PropTypes.func
}

const mapStateToProps = (state) => ({
  user: state.masq.currentUser
})

const mapDispatchToProps = dispatch => ({
  signout: () => dispatch(signout())
})

export default connect(mapStateToProps, mapDispatchToProps)(SidebarMax)
