import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Card } from 'qwant-research-components'

import { fetchApps } from '../../actions'

import styles from './Apps.module.scss'

// const Actions = () => (
//   <div style={{ display: 'flex', alignItems: 'center' }}>
//     {/* <Switch color='#a3005c' label='Enabled' checked /> */}
//     <div style={{ marginRight: 16 }} />
//     <BurgerMenu>
//       <Icon name='Trash' fill='#b2b2b2' />
//     </BurgerMenu>
//   </div>
// )

class Apps extends Component {
  componentDidMount () {
    const { user } = this.props
    if (!user) return

    this.props.fetchApps(user.id)
  }

  render () {
    const { apps, user } = this.props

    if (!user) return <Redirect to='/' />
    if (!apps) return false

    return (
      <div className={styles.Apps}>
        <p className='title'>Mes Applications</p>
        <p className='subtitle'>Retrouvez vos applications synchronisées avec Masq</p>
        {apps.map((app, index) => (
          <div key={index} className={styles.Card}>
            <Card minHeight={64} title={app.name} image={app.image} color='#a3005c' description={app.description} />
          </div>
        ))}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.masq.currentUser,
  apps: state.masq.apps
})

const mapDispatchToProps = dispatch => ({
  fetchApps: (profileId) => dispatch(fetchApps(profileId))
})

Apps.propTypes = {
  apps: PropTypes.array,
  user: PropTypes.object,
  fetchApps: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(Apps)
