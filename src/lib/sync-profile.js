import signalhub from 'signalhubws'
import swarm from 'webrtc-swarm'
import * as common from 'masq-common'
import uuidv4 from 'uuid'

import Masq from './masq'
import { waitForPeer, waitForDataFromPeer, sendEncryptedJSON, decryptJSON, debug } from './utils'

const { dbReady, createPromisifiedHyperDB } = common.utils
const { genAESKey, exportKey } = common.crypto

const { REACT_APP_SIGNALHUB_URLS } = process.env

class SyncProfile {
  constructor (options) {
    this.key = null // encryption key
    this.channel = ''
    this.hub = null
    this.sw = null
    this.peer = null
    this.db = null
    this.masq = new Masq()
    this.hubUrl = options ? options.hubUrl : REACT_APP_SIGNALHUB_URLS
    this.swarmOptions = options ? options.swarmOptions : null
  }

  async init (channel = null, key = null) {
    this.channel = channel || this._getRandomChannel()
    this.key = key || await this._genKey()
  }

  async _genKey () {
    const key = await genAESKey(true, 'AES-GCM', 256)
    return key
  }

  async _getKeyBase64 () {
    const key = await exportKey(this.key)
    return Buffer.from(key).toString('base64')
  }

  _getRandomChannel () {
    return uuidv4()
  }

  async getSecureLink () {
    const secureLink = new URL(window.location)
    const requestType = 'pullProfile'
    const keyBase64 = await this._getKeyBase64()
    const hashParams = JSON.stringify([requestType, this.channel, keyBase64])
    secureLink.hash = '/sync/' + Buffer.from(hashParams).toString('base64')

    return secureLink.toString()
  }

  async joinSecureChannel () {
    this.hub = signalhub(this.channel, this.hubUrl)
    this.hub.on('error', (err) => { throw err })

    this.sw = swarm(this.hub, this.swarmOptions)
    this.sw.on('disconnect', () => { })
    this.sw.on('error', (err) => { throw err })

    const peer = await waitForPeer(this.sw)
    this.peer = peer
  }

  async pullProfile () {
    let data

    await sendEncryptedJSON({ msg: 'pullProfile' }, this.key, this.peer)

    data = await waitForDataFromPeer(this.peer)
    const { msg, id, key, publicProfile } = await decryptJSON(data, this.key)
    debug('pullProfile received:', msg, id, key)

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
    debug('pullProfile received:', msg2)

    if (msg2 !== 'writeAccessGranted') throw new Error('refused')

    // this should block until the profile value is replicated
    await this.db.getAsync('/profile')
    // We have now the profile synced, stop replication.
    // The user can now log in to start further replication of the profile and apps
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
    debug('pushProfile received:', msg2, key)

    if (!key || msg2 !== 'requestWriteAccess') throw new Error('msg not expected' + msg2)

    await db.authorizeAsync(Buffer.from(key, 'hex'))
    await sendEncryptedJSON({ msg: 'writeAccessGranted' }, this.key, this.peer)
  }
}

export default SyncProfile
