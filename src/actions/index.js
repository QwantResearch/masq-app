import { Masq } from '../library'

const masq = new Masq()

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

export const signin = user => {
  return function (dispatch) {
    return masq.openProfile(user.id)
      .then((profile) => dispatch({
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

export const fetchApps = () => {
  return function (dispatch) {
    return masq.getApps()
      .then(apps => dispatch(receiveApps(apps)))
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
      .then((isConnected) => dispatch(updateCurrentAppRequest({
        isConnected: isConnected
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
