import signalhub from 'signalhubws'
import swarm from 'webrtc-swarm'
import * as common from 'masq-common'

const { dbReady, createPromisifiedHyperDB } = common.utils
const { importKey, encrypt, decrypt } = common.crypto

class SyncProfile {
  constructor (options) {
    this.swarmOptions = options
      ? options.swarmOptions || null
      : null

    this.hubUrl = options.hubUrl

    this.key = null // encryption key

    this.channel = ''
    this.hub = null
    this.sw = null
    this.peer = null
  }

  async joinSecureChannel (channel, rawKey) {
    console.log('joinSecureChannel')
    this.key = await importKey(Buffer.from(rawKey, 'base64'))

    this.hub = signalhub(channel, this.hubUrl)
    this.hub.on('error', () => {})

    this.sw = swarm(this.hub, this.swarmOptions)
    this.sw.on('disconnect', () => { })

    const peer = await this.waitForPeer()
    this.peer = peer
  }

  async pullProfile () {
    let data
    console.log('pullProfile')
    await this.sendEncryptedJSON({ msg: 'pullProfile' })

    data = await this.waitForDataFromPeer()
    const { msg, id, key } = await this.decryptJSON(data)
    console.log('pull data', msg, id, key)

    if (!id || !key || msg !== 'pushProfile') throw new Error('refused')

    // create profile
    const db = await createPromisifiedHyperDB(id, key)
    await dbReady(db)
    await this.sendEncryptedJSON({ msg: 'requestWriteAccess', key: '0x' })

    data = await this.waitForDataFromPeer()
    const { msg: msg2 } = await this.decryptJSON(data)
    console.log('pull data', msg2)
    if (msg2 !== 'writeAccessGranted') throw new Error('refused')
  }

  async pushProfile (db, id) {
    let data
    console.log('pushProfile')
    data = await this.waitForDataFromPeer()
    const { msg } = await this.decryptJSON(data)
    console.log('push data', msg)

    if (msg !== 'pullProfile') throw new Error('msg not expected' + msg)

    await this.sendEncryptedJSON({
      msg: 'pushProfile',
      key: db.key.toString('hex'),
      id
    })

    data = await this.waitForDataFromPeer()
    const { msg: msg2, key } = await this.decryptJSON(data)
    console.log('push data', msg, key)
    if (!key || msg2 !== 'requestWriteAccess') throw new Error('msg not expected' + msg2)
    // db.authorize(key)
    await this.sendEncryptedJSON({ msg: 'writeAccessGranted' })
  }

  async sendEncryptedJSON (message) {
    const encryptedMsg = await encrypt(this.key, message, 'base64')
    this.peer.send(JSON.stringify(encryptedMsg))
  }

  async decryptJSON (message) {
    const json = await decrypt(this.key, JSON.parse(message), 'base64')
    return json
  }

  async waitForDataFromPeer () {
    return new Promise((resolve) => {
      this.peer.once('data', (data) => {
        resolve(data)
      })
    })
  }

  async waitForPeer () {
    return new Promise((resolve) => {
      this.sw.once('peer', (peer) => {
        resolve(peer)
      })
    })
  }
}

export default SyncProfile
