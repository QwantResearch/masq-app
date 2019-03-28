import React from 'react'
import { connect } from 'react-redux'
import { Redirect, NavLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Grid, Smartphone, Settings, LogOut } from 'react-feather'

import { Avatar, Typography, Space } from '../../components'
import { signout } from '../../actions'

import styles from './SidebarMin.module.scss'

class SidebarMin extends React.Component {
  render () {
    const { user, signout } = this.props

    if (!user) return <Redirect to='/' />

    return (
      <div className={styles.Sidebar}>
        <div>
          <div className={styles.header}>
            <Avatar {...user} size={58} />
            <Space size={8} />
            <Typography type='username'>{user.username}</Typography>
          </div>

          <div className={styles.nav}>
            <NavLink to='/apps' className={styles.navElement} activeClassName={styles.active}>
              <Grid opacity={0.8} width={24} />
              <p className='label' />
            </NavLink>
            <NavLink to='/devices' className={styles.navElement} activeClassName={styles.active}>
              <Smartphone opacity={0.8} width={24} />
              <p className='label' />
            </NavLink>
            <NavLink to='/settings' className={styles.navElement} activeClassName={styles.active}>
              <Settings opacity={0.8} width={24} />
              <p className='label' />
            </NavLink>
          </div>
        </div>

        <div className={styles.logout} onClick={signout}>
          <div className={styles.navElement}>
            <LogOut opacity={0.8} width={24} />
            <p className='label' />
          </div>
        </div>
      </div>
    )
  }
}

SidebarMin.propTypes = {
  user: PropTypes.object,
  signout: PropTypes.func
}

const mapStateToProps = (state) => ({
  user: state.masq.currentUser
})

const mapDispatchToProps = dispatch => ({
  signout: () => dispatch(signout())
})

export default connect(mapStateToProps, mapDispatchToProps)(SidebarMin)
