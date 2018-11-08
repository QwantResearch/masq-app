import Masq from './masq'

// use an in memory random-access-storage instead
jest.mock('random-access-idb', () =>
  () => require('random-access-memory'))

const masq = new Masq()

test('init', async () => {
  await masq.init()
})

test('add a new profile and retrieve it', async () => {
  const profile = {
    username: 'JDoe',
    firstname: 'John',
    lastname: 'Doe'
  }

  await masq.addProfile(profile)
  const profiles = await masq.getProfiles()
  expect(profiles).toHaveLength(1)
  expect(profiles[0]).toEqual(profile)
  expect(profiles[0].id).toBeDefined()
})

test('update an existing profile', async () => {
  let profiles = await masq.getProfiles()
  let profile = profiles[0]
  profile.username = 'updatedUsername'

  await masq.updateProfile(profile)
  profiles = await masq.getProfiles()
  expect(profiles).toHaveLength(1)
  expect(profiles[0]).toEqual(profile)
})

test('should throw if there is no id in profile', async () => {
  expect.assertions(1)
  const profiles = await masq.getProfiles()
  let profile = profiles[0]
  delete profile.id

  try {
    await masq.updateProfile(profile)
  } catch (e) {
    expect(e.message).toBe('Missing id')
  }
})

test('add an app and retrieve it', async () => {
  const app = { name: 'myapp' }
  const profileId = 'profileId'

  await masq.addApp(profileId, app)
  const apps = await masq.getApps(profileId)
  expect(apps).toHaveLength(1)
  expect(apps[0].id).toBeDefined()
  expect(apps[0]).toEqual(app)
})

test('update an app', async () => {
  const profileId = 'profileId'
  let apps = await masq.getApps(profileId)
  const app = apps[0]
  app.name = 'new name'

  await masq.updateApp(profileId, app)
  apps = await masq.getApps(profileId)
  expect(apps).toHaveLength(1)
  expect(apps[0]).toEqual(app)
})

test('should throw if there is no id in app', async () => {
  expect.assertions(1)
  const profileId = 'profileId'
  const apps = await masq.getApps(profileId)
  let app = apps[0]
  delete app.id

  try {
    await masq.updateApp(profileId, app)
  } catch (e) {
    expect(e.message).toBe('Missing id')
  }
})

test('add a device and retrieve it', async () => {
  const device = { name: 'mydevice' }
  const profileId = 'profileId'

  await masq.addDevice(profileId, device)
  const devices = await masq.getDevices(profileId)
  expect(devices).toHaveLength(1)
  expect(devices[0].id).toBeDefined()
  expect(devices[0]).toEqual(device)
})

test('update a device', async () => {
  const profileId = 'profileId'
  let devices = await masq.getDevices(profileId)
  const device = devices[0]
  device.name = 'new name'

  await masq.updateDevice(profileId, device)
  devices = await masq.getDevices(profileId)
  expect(devices).toHaveLength(1)
  expect(devices[0]).toEqual(device)
})

test('should throw if there is no id in device', async () => {
  expect.assertions(1)
  const profileId = 'profileId'
  const devices = await masq.getDevices(profileId)
  let device = devices[0]
  delete device.id

  try {
    await masq.updateApp(profileId, device)
  } catch (e) {
    expect(e.message).toBe('Missing id')
  }
})
