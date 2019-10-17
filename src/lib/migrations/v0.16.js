import { utils } from 'masq-common'
import { debug } from '../utils'

const { createPromisifiedHyperDB } = utils
/**
 * Open or create a hyperdb instance
 * @param {string} name The indexeddb store name
 */
const openOrCreateDB = (name, key = null) => {
  return createPromisifiedHyperDB(name, key)
}

const migration = async (masq, profileId) => {
  debug('start migration')

  const apps = await masq.getApps()
  for (const app of apps) {
    const myDevice = await masq.getDevice()
    const appId = `app-${profileId}-${app.id}`
    const exist = myDevice.apps.find(({ id }) => id === appId)

    if (exist) {
      debug('App already exists in current device info')
    } else {
      debug('Add app to current device info')
      const appDb = masq.appsDBs[appId] ? masq.appsDBs[appId] : openOrCreateDB(appId)
      await masq.updateDevice({
        ...myDevice,
        apps: [...myDevice.apps, {
          id: appId,
          key: appDb.key.toString('hex'),
          discoveryKey: appDb.discoveryKey.toString('hex'),
          localKey: appDb.local.key.toString('hex')
        }]
      })
    }
  }
}

export default migration
