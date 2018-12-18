import React from 'react'
import PropTypes from 'prop-types'
import { Button, Loader } from 'qwant-research-components'
import { connect } from 'react-redux'

import { setSyncStep } from '../../actions'
import { Modal } from '../../components'
import { ReactComponent as CheckCircle } from '../../assets/check-circle.svg'

import styles from './SyncDevice.module.scss'

class SyncDevice extends React.Component {
  constructor (props) {
    super(props)
    this.handleOnClose = this.handleOnClose.bind(this)
  }

  componentDidMount () {
    const that = this
    const timer = setInterval(() => {
      that.props.setSyncStep(that.props.syncStep + 1)
      if (that.props.syncStep === 2) clearInterval(timer)
    }, 3000)
  }

  copyLink () {
    const link = document.querySelector('input')
    link.select()
    document.execCommand('copy')
  }

  handleOnClose () {
    this.props.setSyncStep(0) // Reset syncStep
    this.props.onClose()
  }

  renderSyncLink () {
    return (
      <Modal height={370} width={511} onClose={this.handleOnClose}>
        <div className={styles.SyncDevice}>
          <p className={styles.title}>Ajouter un appareil</p>
          <p className={styles.description}>
            Copiez-collez le lien suivant pour synchroniser votre profil et vos applications avec un autre appareil.
          </p>
          <input id='link' readOnly defaultValue='qwa.nt/0BJ8ZX' />
          <Button label='Copier' onClick={this.copyLink} />
        </div>
      </Modal>
    )
  }

  renderSyncLoading () {
    return (
      <Modal height={370} width={511} onClose={this.handleOnClose}>
        <div className={styles.SyncDevice}>
          <p className={styles.title}>Ajouter un appareil</p>
          <p className={styles.description}>Synchronisation en cours, veuillez patienter...</p>
          <div className={styles.loader}>
            <Loader />
          </div>
        </div>
      </Modal>
    )
  }
  renderSyncComplete () {
    return (
      <Modal height={370} width={511} onClose={this.handleOnClose}>
        <div className={styles.SyncDevice}>
          <CheckCircle width={160} height={160} color='#40ae6c' />
          <p className={styles.description}>Synchronisation terminée. Vous pouvez maintenant vous connecter</p>
          <Button label='OK' onClick={this.handleOnClose} />
        </div>
      </Modal>
    )
  }

  render () {
    const { syncStep } = this.props
    return (
      <div>
        {/* <Notification style={{ position: 'relative' }} title='Lien copié dans le presse-papier' /> */}
        { syncStep === 0 && this.renderSyncLink() }
        { syncStep === 1 && this.renderSyncLoading() }
        { syncStep === 2 && this.renderSyncComplete() }
      </div>
    )
  }
}

SyncDevice.propTypes = {
  onClose: PropTypes.func.isRequired,
  setSyncStep: PropTypes.func.isRequired,
  syncStep: PropTypes.number
}

const mapStateToProps = state => ({
  syncStep: state.masq.syncStep
})

const mapDispatchToProps = (dispatch) => ({
  setSyncStep: (step) => dispatch(setSyncStep(step))
})

export default connect(mapStateToProps, mapDispatchToProps)(SyncDevice)
