import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { SyncDevice } from '../../modals'
import SyncProfile from '../../lib/sync-profile'

const Sync = ({ history }) => {
  const [syncStep, setSyncStep] = useState('syncing')

  useEffect(() => {
    if (window.location.hash.substring(0, 7) !== '#/sync/') return
    const hash = window.location.hash.substr(7) // ignore #/sync/ characters

    if (!hash.length) return
    const decoded = Buffer.from(hash, 'base64')

    const startSync = async () => {
      const sp = new SyncProfile()

      try {
        const [msg, channel, key] = JSON.parse(decoded)
        if (msg !== 'pullProfile') throw new Error('Unexpected message')
        await sp.init(channel, Buffer.from(key, 'base64'))
        await sp.joinSecureChannel()
        await sp.pullProfile()
        setSyncStep('finished')
      } catch (e) {
        setSyncStep('error')
      }
    }

    startSync()
  }, [])

  const onClick = () => {
    history.push('/')
  }

  return <SyncDevice step={syncStep} onClick={onClick} />
}

Sync.propTypes = {
  history: PropTypes.object.isRequired
}

export default Sync
