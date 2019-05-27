import * as common from 'masq-common'
import signalhub from 'signalhubws'
import swarm from 'webrtc-swarm'

import SyncProfile from '../src/library/sync-profile'
const { expect } = require('chai')

const { dbReady, createPromisifiedHyperDB } = common.utils
const { genAESKey, exportKey } = common.crypto

describe('sync-profile', function () {
  this.timeout(30000)

  before(async () => {
    this.cryptoKey = await genAESKey(true, 'AES-GCM', 128)
    this.key = await exportKey(this.cryptoKey)
    this.keyBase64 = Buffer.from(this.key).toString('base64')
  })

  after(() => {

  })

  it('should join the secure channel', async () => {
    const sp = new SyncProfile({ hubUrl: 'localhost:8080' })
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub)

    const join = new Promise((resolve) => {
      sw.on('close', () => resolve())
      sw.on('peer', () => sw.close())
      sp.joinSecureChannel('channel', this.keyBase64)
    })

    await join
  })

  it('should pullProfile', async () => {
    const sp1 = new SyncProfile({ hubUrl: 'localhost:8080' })
    const sp2 = new SyncProfile({ hubUrl: 'localhost:8080' })
    const dbName = 'id'

    const db = createPromisifiedHyperDB(dbName)
    await dbReady(db)

    await Promise.all([
      sp1.joinSecureChannel('channel2', this.keyBase64),
      sp2.joinSecureChannel('channel2', this.keyBase64)
    ])

    await Promise.all([
      sp2.pushProfile(db, dbName + '-copy'),
      sp1.pullProfile()
    ])

    expect(db._authorized).to.have.lengthOf(2)
  })
})
