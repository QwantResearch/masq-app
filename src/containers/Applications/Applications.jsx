import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Trash } from 'react-feather'

import { fetchApps, removeApp, setNotification } from '../../actions'
import { Card, Typography, Space } from '../../components'
import { DeleteAppDialog } from '../../modals'

import styles from './Applications.module.scss'

class Apps extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      appToRemove: null,
      confirmDialog: false
    }

    this.confirmDelete = this.confirmDelete.bind(this)
    this.handleTrashClick = this.handleTrashClick.bind(this)
    this.closeConfirmDialog = this.closeConfirmDialog.bind(this)
  }

  componentDidMount () {
    if (!this.props.user) return
    this.props.fetchApps()
  }

  handleTrashClick (app) {
    this.setState({
      appToRemove: app,
      confirmDialog: true
    })
  }

  async closeConfirmDialog () {
    this.setState({
      appToRemove: null,
      confirmDialog: false
    })
  }

  async confirmDelete () {
    const { removeApp, setNotification } = this.props
    const { appToRemove } = this.state
    await removeApp(appToRemove)
    this.closeConfirmDialog()
    setNotification({
      title: 'Application supprimée avec succès.'
    })
  }

  render () {
    const { apps, user } = this.props
    const { confirmDialog, appToRemove } = this.state

    if (!user) return <Redirect to='/' />

    return (
      <div className={styles.Apps}>
        {confirmDialog && <DeleteAppDialog
          app={appToRemove}
          onConfirm={() => this.confirmDelete()}
          onCancel={() => this.closeConfirmDialog()}
          onClose={() => this.closeConfirmDialog()}
        />}

        <div className={styles.topSection}>
          <Typography type='title-page'>Mes applications</Typography>
        </div>

        <Space size={16} />

        {apps.length === 0 && <Typography type='paragraph'>Vous n'avez pas d'applications pour le moment</Typography>}

        <div className={styles.cards}>
          {apps.map((app, index) => (
            <div key={index} className={styles.Card}>
              <Card
                minHeight={64}
                title={app.name}
                image={app.imageURL}
                color='#a3005c'
                description={app.description}
                actions={
                  <Trash
                    className={styles.trashIcon}
                    onClick={() => this.handleTrashClick(app)}
                  />
                }
              />
            </div>
          ))}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  user: state.masq.currentUser,
  apps: state.masq.apps
})

const mapDispatchToProps = dispatch => ({
  fetchApps: () => dispatch(fetchApps()),
  removeApp: (app) => dispatch(removeApp(app)),
  setNotification: (notif) => dispatch(setNotification(notif))
})

Apps.propTypes = {
  apps: PropTypes.array,
  user: PropTypes.object,
  fetchApps: PropTypes.func,
  removeApp: PropTypes.func,
  setNotification: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(Apps)
