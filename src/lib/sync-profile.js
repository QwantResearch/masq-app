import signalhub from 'signalhubws'
import swarm from 'webrtc-swarm'
import * as common from 'masq-common'

import Masq from './masq'
import { waitForPeer, waitForDataFromPeer, sendEncryptedJSON, decryptJSON, debug } from './utils'

const { dbReady, createPromisifiedHyperDB } = common.utils
const { importKey } = common.crypto

class SyncProfile {
  constructor (options) {
    this.key = null // encryption key
    this.channel = ''
    this.hub = null
    this.sw = null
    this.peer = null
    this.db = null
    this.masq = new Masq()
    this.hubUrl = options.hubUrl
    this.swarmOptions = options
      ? options.swarmOptions || null
      : null
  }

  async joinSecureChannel (channel, rawKey) {
    debug('joinSecureChannel', channel)
    this.key = await importKey(Buffer.from(rawKey, 'base64'))

    this.hub = signalhub(channel, this.hubUrl)
    this.hub.on('error', () => {})

    this.sw = swarm(this.hub, this.swarmOptions)
    this.sw.on('disconnect', () => { })

    const peer = await waitForPeer(this.sw)
    this.peer = peer
  }

  async pullProfile () {
    let data

    await sendEncryptedJSON({ msg: 'pullProfile' }, this.key, this.peer)

    data = await waitForDataFromPeer(this.peer)
    const { msg, id, key, publicProfile } = await decryptJSON(data, this.key)
    debug('pullProfile received', msg, id, key)

    if (!id || !key || !publicProfile || msg !== 'pushProfile') throw new Error('refused')

    // Create profile database
    this.db = await createPromisifiedHyperDB('profile-' + id, key)
    await dbReady(this.db)
    // Start to replicate the profile
    this.masq._startReplicate(this.db)
    // store public profile
    this.masq._setProfileToLocalStorage(publicProfile)

    const json = {
      msg: 'requestWriteAccess',
      key: this.db.local.key.toString('hex')
    }

    await sendEncryptedJSON(json, this.key, this.peer)

    data = await waitForDataFromPeer(this.peer)
    const { msg: msg2 } = await decryptJSON(data, this.key)
    debug('pullProfile received', msg2)

    if (msg2 !== 'writeAccessGranted') throw new Error('refused')

    // this will block until the profile value is replicated
    await this.db.getAsync('/profile')
    // const test = await this.db.getAsync('/profile/protectedMK')
    // console.log('test', test)
    await this.masq.openProfile(id, 'pass')

    await this.masq.addDevice({
      name: 'new device',
      localKey: this.db.local.key.toString('hex')
    })

    // We have now the profile synced, stop replication.
    // The user can now log in to start further replication of its profile and apps
    this.masq._stopAllReplicates()
  }

  async pushProfile (db, id, publicProfile) {
    let data

    data = await waitForDataFromPeer(this.peer)
    const { msg } = await decryptJSON(data, this.key)

    if (msg !== 'pullProfile') throw new Error('msg not expected' + msg)

    const json = {
      msg: 'pushProfile',
      key: db.key.toString('hex'),
      id,
      publicProfile
    }

    await sendEncryptedJSON(json, this.key, this.peer)

    data = await waitForDataFromPeer(this.peer)
    const { msg: msg2, key } = await decryptJSON(data, this.key)
    debug('pushProfile received', msg2, key)

    if (!key || msg2 !== 'requestWriteAccess') throw new Error('msg not expected' + msg2)

    await db.authorizeAsync(Buffer.from(key, 'hex'))
    await sendEncryptedJSON({ msg: 'writeAccessGranted' }, this.key, this.peer)
  }

  async pullApps (masq) {
    console.log('pullApps')
    // const apps = await masq.getApps()

    // this.db = await createPromisifiedHyperDB('profile-' + id, key)
    // await dbReady(this.db)
    // Start to replicate the profile
    // this.masq._startReplicate(this.db)
  }
}

export default SyncProfile
