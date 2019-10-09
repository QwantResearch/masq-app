import signalhub from 'signalhubws'
import swarm from 'webrtc-swarm'
import * as common from 'masq-common'
import uuidv4 from 'uuid'

import Masq from './masq'
import {
  waitForPeer,
  waitForDataFromPeer,
  sendEncryptedJSON,
  decryptJSON,
  debug,
  dispatchMasqError
} from './utils'

const { dbReady, dbExists, createPromisifiedHyperDB } = common.utils
const { genAESKey, exportKey, importKey } = common.crypto
const { MasqError } = common.errors

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
    this.key = key ? await importKey(key) : await this._genKey()
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
    this.hub.on('error', _ => {
      dispatchMasqError(MasqError.REPLICATION_SIGNALLING_ERROR)
    })

    this.sw = swarm(this.hub, this.swarmOptions)
    this.sw.on('disconnect', () => {})
    this.sw.on('error', _ => {
      dispatchMasqError(MasqError.REPLICATION_SIGNALLING_ERROR)
    })

    const peer = await waitForPeer(this.sw)
    this.peer = peer
  }

  async pullProfile () {
    await sendEncryptedJSON({ msg: 'pullProfile' }, this.key, this.peer)

    const data = await waitForDataFromPeer(this.peer)
    const { msg, id, key, publicProfile } = await decryptJSON(data, this.key)
    debug('pullProfile received:', msg, id, key)

    if (!id || !key || !publicProfile || msg !== 'pushProfile') {
      throw new Error('refused')
    }

    const dbName = 'profile-' + id
    const alreadySynced = await dbExists(dbName)
    if (alreadySynced) {
      const json = {
        msg: 'alreadySynced'
      }
      await sendEncryptedJSON(json, this.key, this.peer)
      throw new Error('alreadySynced')
    }

    const existingsProfiles = await this.masq.getProfiles()
    const importedUsername = publicProfile.username.toUpperCase()
    const usernameExist = existingsProfiles.find(_profile => _profile.username.toUpperCase() === importedUsername)

    // HACK for tests. To test sync we create two dbs on the same device
    if (usernameExist && process.env.NODE_ENV !== 'test') {
      const json = {
        msg: 'usernameAlreadyExists'
      }
      await sendEncryptedJSON(json, this.key, this.peer)
      throw new Error('usernameAlreadyExists')
    }

    // Create profile database
    this.db = await createPromisifiedHyperDB(dbName, key)
    await dbReady(this.db)
    // Start to replicate the profile
    this.masq._startReplicate(this.db)
    // store public profile
    this.masq._setProfileToLocalStorage(publicProfile)
    this.publicProfile = publicProfile
  }

  async abort () {
    const json = {
      msg: 'abort'
    }
    await sendEncryptedJSON(json, this.key, this.peer)
  }

  async sendEnd () {
    const json = {
      msg: 'end'
    }
    await sendEncryptedJSON(json, this.key, this.peer)
  }

  async requestWriteAccess () {
    const json = {
      msg: 'requestWriteAccess',
      key: this.db.local.key.toString('hex')
    }

    await sendEncryptedJSON(json, this.key, this.peer)

    const data = await waitForDataFromPeer(this.peer)
    const { msg: msg2 } = await decryptJSON(data, this.key)
    debug('pullProfile received:', msg2)

    if (msg2 !== 'writeAccessGranted') throw new Error('refused')

    // this should block until the profile value is replicated
    await this.db.getAsync('/profile')
    // The user can now log in to start further replication of the profile and apps
    // this.masq._stopAllReplicates()
  }

  async pushProfile (db, id, publicProfile) {
    if (!db || !id || !publicProfile) {
      throw new Error('Missing parameters')
    }

    let data

    data = await waitForDataFromPeer(this.peer)
    const { msg } = await decryptJSON(data, this.key)

    if (msg !== 'pullProfile') {
      throw new Error('msg not expected ' + msg)
    }

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
    if (!key) throw new Error('no key')

    switch (msg2) {
      case 'alreadySynced':
        throw new Error('alreadySynced')
      case 'abort':
        throw new Error('abort')
      case 'requestWriteAccess':
        await db.authorizeAsync(Buffer.from(key, 'hex'))
        await sendEncryptedJSON({ msg: 'writeAccessGranted' }, this.key, this.peer)
        break
      default:
        throw new Error('msg not expected ' + msg2)
    }

    await db.authorizeAsync(Buffer.from(key, 'hex'))
    await sendEncryptedJSON({ msg: 'writeAccessGranted' }, this.key, this.peer)

    data = await waitForDataFromPeer(this.peer)
    const { msg: msg3 } = await decryptJSON(data, this.key)
    if (msg3 !== 'end') {
      throw new Error('msg not expected ' + msg3)
    }
  }

  async waitUntilAppsDBsAreWritable (masq) {
    if (!masq) throw new Error('missing masq parameter')

    const areDBsWritable = async () => {
      const apps = await masq.getApps()

      if (Object.keys(masq.appsDBs).length !== apps.length) {
        return false
      }

      for (const key of Object.keys(masq.appsDBs)) {
        const db = masq.appsDBs[key]
        if (await db.authorizedAsync(db.local.key) === false) {
          return false
        }
      }

      return true
    }

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        const ok = await areDBsWritable()
        if (ok) {
          clearInterval(interval)
          return resolve()
        }
      }, 500)
    })
  }
}

export default SyncProfile
