import { Masq } from '../library'

const masq = new Masq()
masq.init()

const addUser = user => ({
  type: 'ADD_USER',
  user
})

const receiveUsers = users => ({
  type: 'RECEIVE_USERS',
  users
})

const receiveApps = apps => ({
  type: 'RECEIVE_APPS',
  apps
})

export const signin = user => ({
  type: 'SIGNIN',
  user
})

export const signout = () => ({
  type: 'SIGNOUT'
})

export const updateUser = (id, user) => {
  user.id = id
  return function (dispatch) {
    return masq.updateProfile(user)
      .then(() => dispatch(signin(user)))
  }
}

export const signup = user => {
  return function (dispatch) {
    return masq.addProfile(user)
      .then(() => dispatch(addUser(user)))
  }
}

export const fetchUsers = () => {
  return function (dispatch) {
    return masq.getProfiles()
      .then(users => dispatch(receiveUsers(users)))
  }
}

export const addDevice = device => ({
  type: 'ADD_DEVICE',
  device
})

export const fetchApps = (profileId) => {
  return function (dispatch) {
    return masq.getApps(profileId)
      .then(apps => dispatch(receiveApps(apps)))
  }
}

export const setCurrentAppRequest = app => {
  return {
    type: 'SET_CURRENT_APP_REQUEST',
    app
  }
}

export const createApp = (channel, challenge, app, profileId) => {
  return function (dispatch) {
    return masq.createApp(channel, challenge, app, profileId)
      .then(() => dispatch(fetchApps(profileId)))
  }
}

export const syncProfiles = (channel, challenge) => {
  return function (dispatch) {
    return masq.syncProfiles(channel, challenge, () => {
      console.log('okok sync')
    })
  }
}
