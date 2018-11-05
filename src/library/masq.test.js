const Masq = require('./masq')

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
  const profiles = await masq.getProfiles()

  await masq.addApp(profiles[0].id, app)
  const apps = await masq.getApps()
  expect(apps).toHaveLength(1)
  expect(apps[0].id).toBeDefined()
  expect(apps[0]).toEqual(app)
})

test('update an app', async () => {
  const profileId = await masq.getProfiles()
  let apps = await masq.getApps()
  const app = apps[0]
  app.name = 'new name'

  await masq.updateApp(profileId, app)
  apps = await masq.getApps()
  expect(apps).toHaveLength(1)
  expect(apps[0]).toEqual(app)
})
