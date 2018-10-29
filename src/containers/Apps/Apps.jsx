import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Card, BurgerMenu, Icon } from 'qwant-research-components'

import styles from './Apps.module.scss'

const Actions = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {/* <Switch color='#a3005c' label='Enabled' checked /> */}
    <div style={{ marginRight: 16 }} />
    <BurgerMenu>
      <Icon name='Trash' fill='#b2b2b2' />
    </BurgerMenu>
  </div>
)

const Apps = ({ apps, user }) => {
  if (!user) return <Redirect to='/' />

  return (
    <div className={styles.Apps}>
      <p className='title'>Mes Applications</p>
      <p className='subtitle'>Retrouvez vos applications synchronisées avec Masq</p>
      {apps.map((app, index) => (
        <div key={index} className={styles.Card}>
          <Card minHeight={64} title={app.title} color={app.color} description={app.description} actions={<Actions />} />
        </div>
      ))}
    </div>
  )
}

const mapStateToProps = (state) => ({
  user: state.masq.currentUser,
  apps: state.masq.apps
})

Apps.propTypes = {
  apps: PropTypes.array,
  user: PropTypes.object
}

export default connect(mapStateToProps)(Apps)
