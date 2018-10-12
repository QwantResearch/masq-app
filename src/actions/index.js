import { Masq } from '../library'

const masq = new Masq()
masq.initDatabases()

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
