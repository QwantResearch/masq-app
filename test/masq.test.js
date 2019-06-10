process.env.REACT_APP_SIGNALHUB_URLS = 'localhost:8080'

const Masq = require('../src/lib/masq').default
const { expect } = require('chai')
const signalhub = require('signalhubws')
const swarm = require('webrtc-swarm')
const common = require('masq-common')

const { hashKey, dbExists } = common.utils
const { encrypt, decrypt, exportKey, genAESKey } = common.crypto
const { MasqError } = common.errors

const PASSPHRASE = 'secret'
const NEW_PASSPHRASE = 'secretnew'

const wait = async (timeout = 1000) => new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve()
  }, timeout)
})

describe('masq internal operations', function () {
  this.timeout(30000)

  let masq

  before(() => {
    masq = new Masq()
  })

  after(async () => {
    await masq.closeProfile()
    window.localStorage.clear()
  })

  it('should throw if any required property of profile is not given', async () => {
    let err = null

    const profileWithoutFirstName = {
      username: 'JDoe',
      lastname: 'Doe',
      password: PASSPHRASE,
      image: ''
    }
    try {
      await masq.addProfile(profileWithoutFirstName)
    } catch (e) {
      err = e
    }
    expect(err.code).to.equal(MasqError.WRONG_PARAMETER)
  })

  it('add a new profile and retrieve it from localstorage', async () => {
    const profile = {
      username: 'JDoe',
      firstname: 'John',
      lastname: 'Doe',
      password: PASSPHRASE,
      image: ''
    }

    await masq.addProfile(profile)
    const profiles = await masq.getProfiles()

    expect(profiles).to.have.lengthOf(1)
    expect(profiles[0].id).to.exist
    expect(profiles[0].username).to.equal(profile.username)
  })

  it('trying to register a profile with an existing username should fail', async () => {
    let err = null
    const profile = {
      username: 'JDoe',
      firstname: 'John',
      lastname: 'Doe',
      password: PASSPHRASE,
      image: ''
    }

    try {
      await masq.addProfile(profile)
    } catch (e) {
      err = e
    }
    expect(err.code).to.equal(MasqError.USERNAME_ALREADY_TAKEN)
  })

  it('should throw if there is no opened (logged) profile', async () => {
    let err = null
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }
    profile.username = 'updatedUsername'

    try {
      await masq.updateProfile(profile)
    } catch (e) {
      err = e
    }
    expect(err.code).to.equal(MasqError.PROFILE_NOT_OPENED)
  })

  it('should throw when trying to open profile with bad passphrase', async () => {
    let err = null
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }

    try {
      await masq.openProfile(profile.id, 'badpassphrase')
    } catch (e) {
      err = e
    }
    expect(err.code).to.equal(MasqError.INVALID_PASSPHRASE)
  })

  it('should get the newly added private profile', async () => {
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }

    // Open a profile (login)
    const privateProfile = await masq.openProfile(profile.id, PASSPHRASE)

    expect(privateProfile.id).to.exist
    expect(privateProfile.username).to.equal(profile.username)
    expect(privateProfile.image).to.exist
    expect(privateProfile.firstname).to.exist
    expect(privateProfile.lastname).to.exist
  })

  it('should get protectedMK (must be logged)', async () => {
    const protectedMasterKey = await masq._getProtectedMK()
    const { derivationParams, encryptedMasterKeyAndNonce } = protectedMasterKey
    const { salt, iterations, hashAlgo } = derivationParams

    expect(salt).to.exist
    expect(iterations).to.exist
    expect(hashAlgo).to.exist
    expect(encryptedMasterKeyAndNonce.iv).to.exist
    expect(encryptedMasterKeyAndNonce.ciphertext).to.exist
  })

  it('should update protectedMK after a passphrase change(must be logged)', async () => {
    const protectedMasterKey = await masq._getProtectedMK()
    const { encryptedMasterKeyAndNonce } = protectedMasterKey

    await masq.updatePassphrase(PASSPHRASE, `${PASSPHRASE}new`)
    const protectedMasterKeyNewPass = await masq._getProtectedMK()
    const { encryptedMasterKeyAndNonce: encMKAndNonceNewPass } = protectedMasterKeyNewPass
    expect(encryptedMasterKeyAndNonce.ciphertext).to.not.equal(encMKAndNonceNewPass.ciphertext)
  })

  it('should check if masq-profile values are encrypted', async () => {
    const key = '/profile'
    const hashedKey = await hashKey(key, masq.nonce)
    const node = await masq.profileDB.getAsync(hashedKey)
    expect(node.value.iv).to.exist
    expect(node.value.ciphertext).to.exist
  })

  it('update an existing profile', async () => {
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }
    const updatedName = 'updatedUsername'
    profile.username = updatedName

    await masq.updateProfile(profile)

    // Check public profile
    const updatedPublicProfiles = await masq.getProfiles()
    expect(updatedPublicProfiles).to.have.lengthOf(1)
    expect(updatedPublicProfiles[0].id).to.equal(profile.id)
    expect(updatedPublicProfiles[0].username).to.equal(updatedName)

    // Check private profile
    const privateProfile = await masq.getProfile(profile.id)
    expect(privateProfile.id).to.equal(profile.id)
    expect(privateProfile.username).to.equal(updatedName)
    expect(privateProfile.image).to.exist
    expect(privateProfile.firstname).to.exist
    expect(privateProfile.lastname).to.exist
  })

  it('trying to update a profile with an existing username should fail', async () => {
    let err = null
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

    try {
      await masq.updateProfile(profile)
    } catch (e) {
      err = e
    }
    expect(err.code).to.equal(MasqError.USERNAME_ALREADY_TAKEN)
  })

  it('should throw if there is no id in profile', async () => {
    let err = null
    const profiles = await masq.getProfiles()
    const profile = { ...profiles[0] }
    delete profile.id

    try {
      await masq.updateProfile(profile)
    } catch (e) {
      err = e
    }
    expect(err.code).to.equal(MasqError.MISSING_PROFILE_ID)
  })

  it('add an app and retrieve it', async () => {
    const app = {
      name: 'myapp',
      description: 'description of the app',
      appId: 'id'
    }

    await masq.addApp(app)
    const apps = await masq.getApps()
    expect(apps).to.have.lengthOf(1)
    expect(apps[0].id).to.exist
    expect(apps[0]).to.eql(app)
  })

  it('update an app', async () => {
    let apps = await masq.getApps()
    const app = apps[0]
    app.name = 'new name'

    await masq.updateApp(app)
    apps = await masq.getApps()
    expect(apps).to.have.lengthOf(1)
    expect(apps[0]).to.eql(app)
  })

  it('should throw if there is no id in app', async () => {
    let err = null
    const apps = await masq.getApps()
    const app = { ...apps[0] }

    delete app.id

    try {
      await masq.updateApp(app)
    } catch (e) {
      err = e
    }

    expect(err.code).to.equal(MasqError.MISSING_RESOURCE_ID)
  })

  it('should delete the app', async () => {
    const profiles = await masq.getProfiles()
    const profile = profiles[0].username === 'updatedUsername' ? profiles[0] : profiles[1]

    // Open a profile (login)
    await masq.openProfile(profile.id, NEW_PASSPHRASE)
    let apps = await masq.getApps()
    const app = apps[0]
    expect(apps).to.have.lengthOf(1)
    // Just to be sure that startReplicate is finished.
    await wait()
    await masq.removeApp(app)
    apps = await masq.getApps()
    expect(apps).to.have.lengthOf(0)
  })

  it('add a device and retrieve it', async () => {
    const device = { name: 'mydevice' }

    await masq.addDevice(device)
    const devices = await masq.getDevices()
    expect(devices).to.have.lengthOf(1)
    expect(devices[0].id).to.exist
    expect(devices[0]).to.eql(device)
  })

  it('update a device', async () => {
    let devices = await masq.getDevices()
    const device = devices[0]
    device.name = 'new name'

    await masq.updateDevice(device)
    const updatedDevices = await masq.getDevices()
    expect(updatedDevices).to.have.lengthOf(1)
    expect(updatedDevices[0]).to.eql(device)
  })

  it('should throw if there is no id in device', async () => {
    let err = null
    const devices = await masq.getDevices()
    const device = { ...devices[0] }
    delete device.id

    try {
      await masq.updateDevice(device)
    } catch (e) {
      err = e
    }

    expect(err.code).to.equal(MasqError.MISSING_RESOURCE_ID)
  })

  it('should remove the profile and all its associated data', async () => {
    const app = { name: 'myapp', description: 'desc', appId: 'id' }
    const profiles = await masq.getProfiles()

    const profile = profiles.filter(profile => profile.username === 'updatedUsername')[0]
    const dbNameProfile = `profile-${profile.id}`

    // Open a profile (login)
    await masq.openProfile(profile.id, NEW_PASSPHRASE)

    // Add an app
    await masq.addApp(app)

    let apps = await masq.getApps()
    expect(apps).to.have.lengthOf(1)

    // Simulate a synchronization of the app db
    const dbNameApp = `app-${profile.id}-${apps[0].id}`
    await masq._createDBAndSyncApp(dbNameApp)

    const localStorageLength = window.localStorage.length
    expect(localStorageLength).to.be.greaterThan(0)
    expect(await dbExists(dbNameApp)).to.be.true
    expect(await dbExists(dbNameProfile)).to.be.true

    await masq.removeProfile()

    expect(window.localStorage.length).to.equal(localStorageLength - 1)
    expect(await dbExists(dbNameProfile)).to.be.false
  })
})

describe('masq protocol', function () {
  let cryptoKey
  let key
  let keyBase64
  let masq

  this.timeout(30000)

  before(async () => {
    masq = new Masq()
    cryptoKey = await genAESKey(true, 'AES-GCM', 128)
    key = await exportKey(cryptoKey)
    keyBase64 = Buffer.from(key).toString('base64')

    const profile = {
      username: 'JDoe',
      firstname: 'John',
      lastname: 'Doe',
      password: PASSPHRASE,
      image: ''
    }

    await masq.addProfile(profile)
    const profiles = await masq.getProfiles()
    const { id } = { ...profiles[0] }
    try {
      await masq.openProfile(id, PASSPHRASE)
    } catch (e) {
      console.error(e)
    }
  })

  it('handleUserAppLogin should connect to the swarm', async () => {
    let err = null
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub)

    sw.on('peer', () => {
      sw.close()
    })

    try {
      await masq.handleUserAppLogin('channel', keyBase64, 'someAppId')
    } catch (e) {
      err = e
    }
    expect(err.code).to.equal(MasqError.DISCONNECTED_DURING_LOGIN)
  })

  it('should send masqAccessRefused', (done) => {
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub)

    sw.on('close', () => {
      setTimeout(done, 1000)
    })

    sw.on('peer', peer => {
      peer.once('data', async (data) => {
        const { msg } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
        expect(msg).to.equal('notAuthorized', msg)

        peer.once('data', async (data) => {
          const { msg } = await decrypt(cryptoKey, JSON.parse(data), 'base64')

          expect(msg).to.equal('masqAccessRefused')
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

    masq.handleUserAppLogin('channel', keyBase64, 'someAppId')
      .then(() => masq.handleUserAppRegister(false)) // Access is not granted by the user
  })

  it('should send notAuthorized, and give write access', (done) => {
    const hub = signalhub('channel2', 'localhost:8080')
    const sw = swarm(hub)

    sw.on('close', () => setTimeout(done, 1000))

    sw.once('peer', peer => {
      peer.once('data', async (data) => {
        const { msg } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
        expect(msg).to.equal('notAuthorized')
        peer.once('data', async (data) => {
          const { msg, key, userAppDbId, userAppDEK, username, profileImage, userAppNonce } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
          expect(msg).to.equal('masqAccessGranted')
          expect(key).to.exist
          expect(userAppDbId).to.exist
          expect(userAppDEK).to.exist
          expect(userAppNonce).to.exist
          expect(username).to.exist
          expect(profileImage).to.exist

          const message = {
            msg: 'requestWriteAccess',
            key: '1982524189cae29354879cfe2d219628a8a057f2569a0f2ccf11253cf2b55f3b'
          }
          const encryptedMsg = await encrypt(cryptoKey, message, 'base64')
          peer.send(JSON.stringify(encryptedMsg))

          peer.once('data', async (data) => {
            const { msg } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
            expect(msg).to.equal('writeAccessGranted')
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

    masq.handleUserAppLogin('channel2', keyBase64, 'someAppId')
      .then(() => masq.handleUserAppRegister(true))
  })

  it('should send authorized and close connection', done => {
    const hub = signalhub('channel', 'localhost:8080')
    const sw = swarm(hub)

    sw.on('close', done)

    sw.once('peer', peer => {
      peer.once('data', async (data) => {
        const { msg, userAppDbId, userAppDEK, username, profileImage, userAppNonce } = await decrypt(cryptoKey, JSON.parse(data), 'base64')
        expect(msg).to.equal('authorized')
        expect(userAppDbId).to.exist
        expect(userAppDEK).to.exist
        expect(userAppNonce).to.exist
        expect(username).to.exist
        expect(profileImage).to.exist

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
