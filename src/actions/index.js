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

const addApp = (name) => ({
  type: 'ADD_APP',
  app: { title: name, description: 'Maps by Qwant', color: '#a3005c' }
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

export const fetchApps = () => {
  return function (dispatch) {
    return masq.getApps('profileId')
      .then(apps => {
        apps.forEach(app => dispatch(addApp(app)))
      })
  }
}

export const setCurrentAppRequest = app => {
  return {
    type: 'SET_CURRENT_APP_REQUEST',
    app
  }
}

export const createAppDB = (name, channel) => {
  return function (dispatch) {
    return masq.createApp(name, channel, () => {
      console.log('okok')
    })
  }
}

export const syncProfiles = (channel, challenge) => {
  return function (dispatch) {
    return masq.syncProfiles(channel, challenge, () => {
      console.log('okok sync')
    })
  }
}
