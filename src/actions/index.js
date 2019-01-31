import { Masq } from '../library'

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
  return function (dispatch) {
    return masq.addProfile(user)
      .then(() => dispatch(fetchUsers()))
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
  return async function (dispatch) {
    let res = null
    for (let i = 0; i < 3; i++) {
      console.log('step ', i)

      try {
        const isConnected = await masq.handleUserAppLogin(channel, key, appId)
        res = isConnected
        break
      } catch (error) {
        if (error.type === 'Initial step not passed') {
          console.log('catch it !!!!')
          console.log('try again')
        } else {
          console.log('original error')
          console.log(error)
          break
        }
      }
    }
    dispatch(updateCurrentAppRequest({
      isConnected: res
    }))
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
