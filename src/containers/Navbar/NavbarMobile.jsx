import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { NavLink, Redirect } from 'react-router-dom'
import { Grid, Smartphone, Settings, ChevronDown } from 'react-feather'
import { withTranslation } from 'react-i18next'
import { signout } from '../../actions'
import { Typography, Dropdown, Avatar, Space } from '../../components'
import { ReactComponent as Logo } from '../../assets/logo-sidebar.svg'

import styles from './NavbarMobile.module.scss'

class NavbarMobile extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      hovered: false
    }
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    this.setState({ hovered: !this.state.hovered })
  }

  render () {
    const { hovered } = this.state
    const { user, signout, t } = this.props

    if (!user) return <Redirect to='/' />

    return (
      <div className={styles.NavbarMobile}>
        <div className={styles.header}>
          <div className={styles.content}>
            <Logo />
            <div className={styles.user} onClick={this.handleClick}>
              <Avatar size={32} image={user.image} username={user.username} />
              <Space size={8} direction='right' />
              <Typography id='navbar-username-output' type='username'>{user.username}</Typography>
              <ChevronDown className={styles.chevron} size={14} color='white' />
              {hovered && <Dropdown onClick={signout} />}
            </div>
          </div>
        </div>
        <div className={styles.nav}>
          <div className={styles.content}>
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
        </div>
      </div>
    )
  }
}

NavbarMobile.propTypes = {
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

const translatedNavbarMobile = withTranslation()(NavbarMobile)
export default connect(mapStateToProps, mapDispatchToProps)(translatedNavbarMobile)
