import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Card, Icon } from 'qwant-research-components'

import { fetchApps } from '../../actions'
import { ConfirmDialog } from '../../modals'

import styles from './Apps.module.scss'

class Apps extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
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

  handleTrashClick () {
    console.log('handleTrashClick')
    this.setState({
      confirmDialog: true
    })
  }

  closeConfirmDialog () {
    this.setState({
      confirmDialog: false
    })
  }

  confirmDelete () {
    console.log('confirmDelete, need to call action')
    this.closeConfirmDialog()
  }

  render () {
    const { apps, user } = this.props
    const { confirmDialog } = this.state

    if (!user) return <Redirect to='/' />
    if (!apps) return false

    return (
      <div className={styles.Apps}>
        {confirmDialog && <ConfirmDialog
          title='Confirmation de suppression'
          text='La suppression des données de cette application est irréversible. Etes-vous certain ?'
          onConfirm={() => this.confirmDelete()}
          onCancel={() => this.closeConfirmDialog()}
          onClose={() => this.closeConfirmDialog()}
        />}
        <p className='title'>Mes Applications</p>
        <p className='subtitle'>Retrouvez vos applications synchronisées avec Masq</p>
        {apps.map((app, index) => (
          <div key={index} className={styles.Card}>
            <Card
              minHeight={64}
              title={app.name}
              image={app.imageURL}
              color='#a3005c'
              description={app.description}
              actions={
                <Icon
                  style={{ cursor: 'pointer' }}
                  name='Trash'
                  fill='#b2b2b2'
                  onClick={this.handleTrashClick}
                />
              }
            />
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
  fetchApps: () => dispatch(fetchApps())
})

Apps.propTypes = {
  apps: PropTypes.array,
  user: PropTypes.object,
  fetchApps: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(Apps)
