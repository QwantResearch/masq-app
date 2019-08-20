import React, { useEffect } from 'react'

import SyncProfile from '../../lib/sync-profile'

const Sync = () => {
  useEffect(() => {
    if (window.location.hash.substring(0, 7) !== '#/sync/') return
    const hash = window.location.hash.substr(7) // ignore #/sync/ characters

    if (!hash.length) return
    const decoded = Buffer.from(hash, 'base64')

    const startSync = async () => {
      const sp = new SyncProfile()
      const [msg, channel, key] = JSON.parse(decoded)

      if (msg !== 'pullProfile') return

      await sp.init(channel, Buffer.from(key, 'base64'))
      await sp.joinSecureChannel()
      await sp.pullProfile()
    }
    startSync()
  }, [])

  return <div>Sync</div>
}

export default Sync
