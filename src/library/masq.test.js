import Masq from './masq'

// use an in memory random-access-storage instead
jest.mock('random-access-idb', () =>
  () => require('random-access-memory'))

const masq = new Masq()

afterAll(() => {
  masq.closeProfile()
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
