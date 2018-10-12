import { Masq } from '../library'

const masq = new Masq()
masq.initDatabases()

console.log('masq',masq)

const addUser = user => ({
  type: 'ADD_USER',
  user
})

const receiveUsers = users => ({
  type: 'RECEIVE_USERS',
  users
})

export const signin = user => ({
  type: 'SIGNIN',
  user
})

export const signout = () => ({
  type: 'SIGNOUT'
})

export const updateUser = (id, user) => {
  console.log('action updateUser', id, user)
  return function (dispatch) {
    return masq.updateUser(id, user)
      .then(() => dispatch(signin(user)))
  }
}

export const signup = user => {
  return function (dispatch) {
    return masq.addUser(user)
      .then(() => dispatch(addUser(user)))
  }
}

export const fetchUsers = () => {
  console.log('action fetchUsers')
  return function (dispatch) {
    return masq.getUsers()
      .then(users => dispatch(receiveUsers(users)))
  }
}
