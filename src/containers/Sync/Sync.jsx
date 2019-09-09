import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { fetchUsers } from '../../actions'
import { SyncDevice } from '../../modals'
import SyncProfile from '../../lib/sync-profile'

const Sync = ({ link, onClose, fetchUsers }) => {
  const [syncStep, setSyncStep] = useState('syncing')
  const [message, setMessage] = useState(null)
  const { t } = useTranslation()

  useEffect(() => {
    let hash = ''
    try {
      if (!link.length) throw new Error('invalid link')
      const url = new URL(link)
      if (url.hash.substring(0, 7) !== '#/sync/') return
      hash = url.hash.substr(7) // ignore #/sync/ characters
      if (!hash.length) throw new Error('invalid link')
    } catch (e) {
      return setSyncStep('error')
    }

    const startSync = async () => {
      const decoded = Buffer.from(hash, 'base64')
      const sp = new SyncProfile()

      try {
        const [msg, channel, key] = JSON.parse(decoded)
        if (msg !== 'pullProfile') throw new Error('Unexpected message')
        await sp.init(channel, Buffer.from(key, 'base64'))
        await sp.joinSecureChannel()
        await sp.pullProfile()
        await fetchUsers()
        setSyncStep('finished')
      } catch (e) {
        if (e.message === 'alreadySynced') {
          setMessage(t('This profile is already synchronized on this device.'))
        }
        setSyncStep('error')
      }
    }

    startSync()
  }, [])

  return <SyncDevice step={syncStep} onClick={onClose} message={message} />
}

Sync.propTypes = {
  link: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired
}

const mapDispatchToProps = dispatch => ({
  fetchUsers: user => dispatch(fetchUsers(user))
})

export default connect(null, mapDispatchToProps)(Sync)
