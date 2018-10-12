import React from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'

import styles from './Apps.module.scss'

const Apps = ({ user }) => {
  if (!user) return <Redirect to='/' />

  return (
    <div>
      <h1>TEST</h1>
    </div>
  )
}

const mapStateToProps = (state) => ({
  user: state.masq.currentUser
})

export default connect(mapStateToProps)(Apps)
