import Masq from './masq'

const signalserver = require('signalhubws/server')
const signalhub = require('signalhubws')
const swarm = require('webrtc-swarm')
const wrtc = require('wrtc')
window.crypto = require('@trust/webcrypto')
const common = require('masq-common')

const { encrypt, decrypt, exportKey, genAESKey } = common.crypto
const { ERRORS } = common.errors

const PASSPHRASE = 'secret'

jest.setTimeout(30000)

jest.mock('masq-common', () => {
  const original = require.requireActual('masq-common')
  let dbList = {}
  let originalCreate = original.utils.createPromisifiedHyperDB
  let modified = { ...original }
  modified.utils.dbExists = (name) => {
    return Promise.resolve(!!dbList[name])
  }
  modified.utils.createPromisifiedHyperDB = (name, hexKey) => {
    if (!dbList[name]) {
      dbList[name] = originalCreate(name, hexKey)
    }
    return dbList[name]
  }
  modified.utils.resetDbList = () => {
    dbList = {}
  }
  modified.crypto.genEncryptedMasterKey = async (passphrase) => {
    const protectedMK = {
      derivationParams: {
        salt: '81570bf99c0134985d7d975b69e123ce',
        iterations: 100000,
        hashAlgo: 'SHA-256'
      },

      encryptedMasterKey: {
        ciphertext: Buffer.from(passphrase).toString('hex'),
        iv: '81570bf99c0134985d7d975b69e123ce'
      }
    }
    return Promise.resolve(protectedMK)
  }
  modified.crypto.decryptMasterKey = async (passphrase, protectedMK) => {
    const res = Buffer.from(passphrase).toString('hex') === protectedMK.encryptedMasterKey.ciphertext
    if (res) return Promise.resolve(Buffer.from('00112233445566778899AABBCCDDEEFF', 'hex'))
    if (!res) throw new Error('Wrong passphrase')
  }
  return modified
})

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
  test('should throw if any required property of profile is not given', async () => {
    const profileWithoutFirstName = {
      username: 'JDoe',
      lastname: 'Doe',
      password: PASSPHRASE,
      image: ''
    }
    await expect(masq.addProfile(profileWithoutFirstName))
      .rejects
      .toHaveProperty('type', ERRORS.WRONG_PARAMETER)
  })
  test('add a new profile and retrieve it from localstorage', async () => {
    const profile = {
      username: 'JDoe',
      firstname: 'John',
      lastname: 'Doe',
      password: PASSPHRASE,
      image: ''
    }

    await masq.addProfile(profile)
    const profiles = await masq.getProfiles()

    expect(profiles).toHaveLength(1)
    expect(profiles[0].id).toBeDefined()
    expect(profiles[0].username).toEqual(profile.username)
  })

  test('trying to register a profile with an existing username should fail', async () => {
    const profile = {
      username: 'JDoe',
      firstname: 'John',
      lastname: 'Doe',
      password: PASSPHRASE,
      image: ''
    }

    await expect(masq.addProfile(profile))
      .rejects
      .toHaveProperty('type', ERRORS.USERNAME_ALREADY_TAKEN)
  })

  test('should throw if there is no opened (logged) profile', async () => {
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }
    profile.username = 'updatedUsername'

    await expect(masq.updateProfile(profile))
      .rejects
      .toHaveProperty('type', ERRORS.PROFILE_NOT_OPENED)
  })

  test('should throw when trying to open profile with bad passphrase', async () => {
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }

    await expect(masq.openProfile(profile.id, 'badpassphrase'))
      .rejects
      .toHaveProperty('type', ERRORS.INVALID_PASSPHRASE)
  })

  test('should get the newly added private profile', async () => {
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }

    // Open a profile (login)
    const privateProfile = await masq.openProfile(profile.id, PASSPHRASE)

    expect(privateProfile.id).toBeDefined()
    expect(privateProfile.username).toEqual(profile.username)
    expect(privateProfile.image).toBeDefined()
    expect(privateProfile.firstname).toBeDefined()
    expect(privateProfile.lastname).toBeDefined()
  })

  test('should get protectedMK (must be logged)', async () => {
    const protectedMasterKey = await masq._getProtectedMK()

    const { derivationParams, encryptedMasterKey } = protectedMasterKey
    const { salt, iterations, hashAlgo } = derivationParams
    expect(salt).toBeDefined()
    expect(iterations).toBeDefined()
    expect(hashAlgo).toBeDefined()
    expect(encryptedMasterKey.iv).toBeDefined()
    expect(encryptedMasterKey.ciphertext).toBeDefined()
  })

  test('should check if masq-profile values are encrypted', async () => {
    const node = await masq.profileDB.getAsync('/profile')
    expect(node.value.iv).toBeDefined()
    expect(node.value.ciphertext).toBeDefined()
  })

  test('update an existing profile', async () => {
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }
    const updatedName = 'updatedUsername'
    profile.username = updatedName

    await masq.updateProfile(profile)

    // Check public profile
    const updatedPublicProfiles = await masq.getProfiles()
    expect(updatedPublicProfiles).toHaveLength(1)
    expect(updatedPublicProfiles[0].id).toEqual(profile.id)
    expect(updatedPublicProfiles[0].username).toEqual(updatedName)

    // Check private profile
    const privateProfile = await masq.getProfile(profile.id)
    expect(privateProfile.id).toEqual(profile.id)
    expect(privateProfile.username).toEqual(updatedName)
    expect(privateProfile.image).toBeDefined()
    expect(privateProfile.firstname).toBeDefined()
    expect(privateProfile.lastname).toBeDefined()
  })

  test('trying to update a profile with an existing username should fail', async () => {
    const newProfile = {
      username: 'secondUsername',
      firstname: 'John',
      lastname: 'Doe',
      password: PASSPHRASE,
      image: ''
    }

    await masq.addProfile(newProfile)
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[1], username: profiles[0].username }

    await expect(masq.updateProfile(profile))
      .rejects
      .toHaveProperty('type', ERRORS.USERNAME_ALREADY_TAKEN)
  })

  test('should throw if there is no id in profile', async () => {
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }
    delete profile.id

    await expect(masq.updateProfile(profile))
      .rejects
      .toHaveProperty('type', ERRORS.MISSING_PROFILE_ID)
  })

  test('add an app and retrieve it', async () => {
    const app = {
      name: 'myapp',
      description: 'description of the app',
      appId: 'id'
    }

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
    const apps = await masq.getApps()
    const app = { ...apps[0] }
    delete app.id

    await expect(masq.updateApp(app))
      .rejects
      .toHaveProperty('type', ERRORS.MISSING_RESOURCE_ID)
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
    const updatedDevices = await masq.getDevices()
    expect(updatedDevices).toHaveLength(1)
    expect(updatedDevices[0]).toEqual(device)
  })

  test('should throw if there is no id in device', async () => {
    const devices = await masq.getDevices()
    const device = { ...devices[0] }
    delete device.id

    await expect(masq.updateDevice(device))
      .rejects
      .toHaveProperty('type', ERRORS.MISSING_RESOURCE_ID)
  })
})

describe('masq protocol', async () => {
  let cryptoKey
  let key
  let keyBase64

  beforeAll(async () => {
    cryptoKey = await genAESKey(true, 'AES-GCM', 128)
    key = await exportKey(cryptoKey)
    keyBase64 = Buffer.from(key).toString('base64')
  })

  test('handleUserAppLogin should connect to the swarm', async () => {
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub, { wrtc })

    sw.on('peer', () => sw.close())

    await expect(masq.handleUserAppLogin('channel', keyBase64, 'someAppId'))
      .rejects
      .toHaveProperty('type', 'Initial step not passed')
  })

  test('should send masqAccessRefused', async (done) => {
    expect.assertions(2)
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub, { wrtc })

    sw.on('close', () => setTimeout(done, 1000))

    sw.on('peer', peer => {
      peer.on('error', err => console.error('###', err))

      peer.once('data', async (data) => {
        const { msg } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
        expect(msg).toBe('notAuthorized')

        peer.once('data', async (data) => {
          const { msg } = await decrypt(cryptoKey, JSON.parse(data), 'base64')

          expect(msg).toBe('masqAccessRefused')
          sw.close()
        })

        const message = {
          msg: 'registerUserApp',
          name: 'test app',
          description: 'description goes here',
          imageURL: ''
        }
        const encryptedMsg = await encrypt(cryptoKey, message, 'base64')
        peer.send(JSON.stringify(encryptedMsg))
      })
    })

    await masq.handleUserAppLogin('channel', keyBase64, 'someAppId')
    await masq.handleUserAppRegister(false) // Access is not granted by the user
  })

  test('should send notAuthorized, and give write access', async (done) => {
    expect.assertions(8)
    const hub = signalhub('channel2', 'localhost:8080')
    const sw = swarm(hub, { wrtc })

    sw.on('close', () => setTimeout(done, 1000))

    sw.once('peer', peer => {
      peer.once('data', async (data) => {
        const { msg } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
        expect(msg).toBe('notAuthorized')
        peer.once('data', async (data) => {
          const { msg, key, userAppDbId, userAppDEK, username, profileImage } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
          expect(msg).toBe('masqAccessGranted')
          expect(key).toBeDefined()
          expect(userAppDbId).toBeDefined()
          expect(userAppDEK).toBeDefined()
          expect(username).toBeDefined()
          expect(profileImage).toBeDefined()

          const message = {
            msg: 'requestWriteAccess',
            key: '1982524189cae29354879cfe2d219628a8a057f2569a0f2ccf11253cf2b55f3b'
          }
          const encryptedMsg = await encrypt(cryptoKey, message, 'base64')
          peer.send(JSON.stringify(encryptedMsg))

          peer.once('data', async (data) => {
            const { msg } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
            expect(msg).toBe('writeAccessGranted')
            sw.close()
          })
        })

        const message = {
          msg: 'registerUserApp',
          name: 'test app',
          description: 'description goes here',
          imageURL: ''
        }
        const encryptedMsg = await encrypt(cryptoKey, message, 'base64')
        peer.send(JSON.stringify(encryptedMsg))
      })
    })

    await masq.handleUserAppLogin('channel2', keyBase64, 'someAppId')
    await masq.handleUserAppRegister(true)
  })

  test('should send authorized and close connection', done => {
    expect.assertions(5)
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub, { wrtc })

    sw.on('close', done)

    sw.once('peer', peer => {
      peer.once('data', async (data) => {
        const { msg, userAppDbId, userAppDEK, username, profileImage } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
        expect(msg).toBe('authorized')
        expect(userAppDbId).toBeDefined()
        expect(userAppDEK).toBeDefined()
        expect(username).toBeDefined()
        expect(profileImage).toBeDefined()

        // sw.close()
        const message = {
          msg: 'connectionEstablished'
        }
        const encryptedMsg = await encrypt(cryptoKey, message, 'base64')
        peer.send(JSON.stringify(encryptedMsg))
        sw.close()
      })
    })

    masq.handleUserAppLogin('channel', keyBase64, 'someAppId')
  })
})
