import { Masq } from '../lib'

const masq = new Masq()

const receiveUsers = users => ({
  type: 'RECEIVE_USERS',
  users
})

const receiveApps = apps => ({
  type: 'RECEIVE_APPS',
  apps
})

export const setSyncStep = syncStep => {
  return {
    type: 'SET_SYNC_STEP',
    syncStep
  }
}

export const signin = (user, passphrase) => {
  return function (dispatch) {
    return masq.openProfile(user.id, passphrase)
      .then(profile => dispatch({
        type: 'SIGNIN',
        profile
      }))
  }
}

export const signout = () => {
  return function (dispatch) {
    return masq.closeProfile()
      .then(() => dispatch({
        type: 'SIGNOUT'
      }))
  }
}

export const updateUser = (id, update) => {
  const profile = { ...update, id }
  return function (dispatch) {
    return masq.updateProfile(profile)
      .then(() => dispatch({
        type: 'SIGNIN',
        profile
      }))
  }
}

export const signup = user => {
  const { password } = user
  return function (dispatch) {
    return masq.addProfile(user)
      .then((profile) => dispatch(signin(profile, password)))
  }
}

export const removeProfile = () => {
  return function (dispatch) {
    return masq.removeProfile()
      .then(() => dispatch(signout()))
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

export const fetchApps = () => {
  return function (dispatch) {
    return masq.getApps()
      .then(apps => dispatch(receiveApps(apps)))
  }
}

export const removeApp = (app) => {
  return function (dispatch) {
    return masq.removeApp(app)
      .then(() => dispatch(fetchApps()))
  }
}

export const fetchCurrentAppRequestStatus = () => ({
  type: 'FETCH_CURRENT_APP_REQUEST_STATUS'
})

export const setCurrentAppRequest = app => {
  return {
    type: 'SET_CURRENT_APP_REQUEST',
    app
  }
}

export const updateCurrentAppRequest = update => {
  return {
    type: 'UPDATE_CURRENT_APP_REQUEST',
    update
  }
}

export const handleUserAppLogin = (channel, key, appId) => {
  return function (dispatch) {
    return masq.handleUserAppLogin(channel, key, appId)
      .then((info) => dispatch(updateCurrentAppRequest({
        ...info
      })))
  }
}

export const handleUserAppRegister = (isAccepted) => {
  return function (dispatch) {
    return masq.handleUserAppRegister(isAccepted)
      .then(() => dispatch(updateCurrentAppRequest({
        isConnected: isAccepted
      })))
  }
}

export const setNotification = (notification) => ({
  type: 'SET_NOTIFICATION',
  notification
})

export const setLoading = (loading) => ({
  type: 'SET_LOADING',
  loading
})

export const updatePassphrase = (oldPass, newPass) => {
  return function (dispatch) {
    return masq.updatePassphrase(oldPass, newPass)
  }
}

export const getMasqInstance = () => masq
