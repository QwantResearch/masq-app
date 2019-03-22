import React from 'react'
import { Avatar } from '../../components'
import { connect } from 'react-redux'
import { Redirect, NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Grid, Smartphone, Settings, LogOut } from 'react-feather'

import { signout } from '../../actions'

import styles from './SidebarMax.module.scss'

class SidebarMax extends React.Component {
  render () {
    const { user, signout } = this.props

    if (!user) return <Redirect to='/' />

    return (
      <div className={styles.Sidebar}>
        <div className={styles.header}>
          <Avatar {...user} size={64} />
          <p className='username'>{user.username}</p>
        </div>
        <div className={styles.nav}>
          <NavLink to='/apps' className={styles.navElement} activeClassName={styles.active}>
            <Grid opacity={0.8} width={24} />
            <p className='label'>Applications</p>
          </NavLink>
          <NavLink to='/devices' className={styles.navElement} activeClassName={styles.active}>
            <Smartphone opacity={0.8} width={24} />
            <p className='label'>Appareils</p>
          </NavLink>
          <NavLink to='/settings' className={styles.navElement} activeClassName={styles.active}>
            <Settings opacity={0.8} width={24} />
            <p className='label'>Paramètres</p>
          </NavLink>
        </div>
        <div className={styles.logout} onClick={signout}>
          <div className={styles.navElement}>
            <LogOut opacity={0.8} width={24} />
            <p className='label'>Déconnexion</p>
          </div>
        </div>
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
