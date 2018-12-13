import Masq from './masq'

const signalserver = require('signalhubws/server')
const signalhub = require('signalhubws')
const swarm = require('webrtc-swarm')
const wrtc = require('wrtc')
window.crypto = require('@trust/webcrypto')

const { encryptMessage, decryptMessage } = require('./utils')

// use an in memory random-access-storage instead
jest.mock('random-access-idb', () =>
  () => require('random-access-memory'))

let masq = new Masq()
let server = null

beforeAll((done) => {
  server = signalserver()
  server.listen(8080, (err) => {
    if (err) throw err
    done()
  })
})

afterAll((done) => {
  server.close()
  masq.closeProfile()
  setTimeout(done, 1000) // Wait to be sure server.close has finished
})

describe('masq internal operations', () => {
  test('add a new profile and retrieve it', async () => {
    const profile = {
      username: 'JDoe',
      firstname: 'John',
      lastname: 'Doe'
    }

    await masq.addProfile(profile)
    const profiles = await masq.getProfiles()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBeDefined()
    expect(profiles[0].username).toEqual(profile.username)
  })

  test('should throw if there is no opened (logged) profile', async () => {
    expect.assertions(1)
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }
    profile.username = 'updatedUsername'

    try {
      await masq.updateProfile(profile)
    } catch (e) {
      expect(e.message).toBe('Open a profile first')
    }
  })

  test('update an existing profile', async () => {
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }
    profile.username = 'updatedUsername'

    // Open a profile (login)
    masq.openProfile(profile.id)

    await masq.updateProfile(profile)
    const updatedProfiles = await masq.getProfiles()
    expect(updatedProfiles).toHaveLength(1)
    expect(updatedProfiles[0].id).toBeDefined()
    expect(updatedProfiles[0].username).toEqual(profile.username)
  })

  test('should throw if there is no id in profile', async () => {
    expect.assertions(1)
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }
    delete profile.id

    try {
      await masq.updateProfile(profile)
    } catch (e) {
      expect(e.message).toBe('Missing id')
    }
  })

  test('add an app and retrieve it', async () => {
    const app = { name: 'myapp' }

    await masq.addApp(app)
    const apps = await masq.getApps()
    expect(apps).toHaveLength(1)
    expect(apps[0].id).toBeDefined()
    expect(apps[0]).toEqual(app)
  })

  test('update an app', async () => {
    let apps = await masq.getApps()
    const app = apps[0]
    app.name = 'new name'

    await masq.updateApp(app)
    apps = await masq.getApps()
    expect(apps).toHaveLength(1)
    expect(apps[0]).toEqual(app)
  })

  test('should throw if there is no id in app', async () => {
    expect.assertions(1)
    const apps = await masq.getApps()
    const app = { ...apps[0] }
    delete app.id

    try {
      await masq.updateApp(app)
    } catch (e) {
      expect(e.message).toBe('Missing id')
    }
  })

  test('add a device and retrieve it', async () => {
    const device = { name: 'mydevice' }

    await masq.addDevice(device)
    const devices = await masq.getDevices()
    expect(devices).toHaveLength(1)
    expect(devices[0].id).toBeDefined()
    expect(devices[0]).toEqual(device)
  })

  test('update a device', async () => {
    let devices = await masq.getDevices()
    const device = devices[0]
    device.name = 'new name'

    await masq.updateDevice(device)
    devices = await masq.getDevices()
    expect(devices).toHaveLength(1)
    expect(devices[0]).toEqual(device)
  })

  test('should throw if there is no id in device', async () => {
    expect.assertions(1)
    const devices = await masq.getDevices()
    const device = { ...devices[0] }
    delete device.id

    try {
      await masq.updateApp(device)
    } catch (e) {
      expect(e.message).toBe('Missing id')
    }
  })
})

describe('masq protocol', async () => {
  let cryptoKey
  let key
  let keyBase64

  beforeAll(async () => {
    cryptoKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 128
      },
      true,
      ['encrypt', 'decrypt']
    )
    key = await window.crypto.subtle.exportKey('raw', cryptoKey)
    keyBase64 = key.toString('base64')
  })

  test('handleUserAppLogin should connect to the swarm', done => {
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub, { wrtc })
    sw.on('close', done)

    sw.on('peer', () => sw.close())
    masq.handleUserAppLogin('channel', keyBase64, 'someAppId')
  })

  test('should send masqAccessRefused', done => {
    expect.assertions(2)
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub, { wrtc })

    sw.on('close', done)

    sw.on('peer', peer => {
      peer.once('data', async (data) => {
        const decrypted = await decryptMessage(cryptoKey, data)
        expect(decrypted.msg).toBe('notAuthorized')

        masq.handleUserAppRegister(false) // Access is not granted by the user

        peer.once('data', async (data) => {
          const { msg } = await decryptMessage(cryptoKey, data)
          expect(msg).toBe('masqAccessRefused')
          sw.close()
        })

        const encData = await encryptMessage(cryptoKey, {
          msg: 'registerUserApp',
          name: 'test app',
          description: 'description goes here',
          imageUrl: ''
        })

        peer.send(encData)
      })
    })

    masq.handleUserAppLogin('channel', keyBase64, 'someAppId')
  })

  test('should send notAuthorized, and give write access', done => {
    expect.assertions(5)
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub, { wrtc })

    sw.on('close', done)

    sw.on('peer', peer => {
      peer.once('data', async (data) => {
        const decrypted = await decryptMessage(cryptoKey, data)
        expect(decrypted.msg).toBe('notAuthorized')

        masq.handleUserAppRegister(true)

        peer.once('data', async (data) => {
          const { msg, key, id } = await decryptMessage(cryptoKey, data)
          expect(msg).toBe('masqAccessGranted')
          expect(key).toBeDefined()
          expect(id).toBeDefined()

          const encData = await encryptMessage(cryptoKey, {
            msg: 'requestWriteAccess',
            key: '1982524189cae29354879cfe2d219628a8a057f2569a0f2ccf11253cf2b55f3b'
          })
          peer.send(encData)

          peer.once('data', async (data) => {
            const { msg } = await decryptMessage(cryptoKey, data)
            expect(msg).toBe('writeAccessGranted')
            sw.close()
          })
        })

        const encData = await encryptMessage(cryptoKey, {
          msg: 'registerUserApp',
          name: 'test app',
          description: 'description goes here',
          imageUrl: ''
        })

        peer.send(encData)
      })
    })

    masq.handleUserAppLogin('channel', keyBase64, 'someAppId')
  })

  test('should send authorized and close connection', done => {
    expect.assertions(2)
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub, { wrtc })

    sw.on('close', done)
    sw.on('disconnect', () => {
      sw.close()
    })

    sw.once('peer', peer => {
      peer.once('data', async (data) => {
        const { msg, id } = await decryptMessage(cryptoKey, data)
        expect(msg).toBe('authorized')
        expect(id).toBeDefined()

        // sw.close()
        const encData = await encryptMessage(cryptoKey, {
          msg: 'connectionEstablished'
        })

        peer.send(encData)
        sw.close()
      })
    })

    masq.handleUserAppLogin('channel', keyBase64, 'someAppId')
  })
})
