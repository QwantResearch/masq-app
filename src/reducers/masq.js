const masq = (state = {
  users: [],
  apps: [],
  currentUser: null
}, action) => {
  console.log(action.type)
  switch (action.type) {
    case 'ADD_USER':
      console.log('ADD_USER', action.user)
      return {
        ...state,
        users: [...state.users, action.user]
      }
    case 'SIGNIN':
      console.log('SIGNIN', action.user)
      return {
        ...state,
        currentUser: action.user
      }
    case 'SIGNOUT':
      console.log('SIGNOUT')
      return {
        ...state,
        currentUser: null
      }
    case 'RECEIVE_USERS':
      console.log('RECEIVE_USERS')
      return {
        ...state,
        users: action.users
      }
    case 'SET_CURRENT_APP_REQUEST':
      console.log('SET_CURRENT_APP_REQUEST', action.app)
      return {
        ...state,
        currentAppRequest: action.app
      }
    case 'ADD_APP':
      console.log('ADD APP', action.app)
      return {
        ...state,
        apps: [...state.apps, action.app]
      }
    default:
      return state
  }
}

export default masq
