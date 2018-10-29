const masq = (state = {
  users: [],
  apps: [],
  currentUser: null
}, action) => {
  console.log(action.type)
  switch (action.type) {
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.user]
      }
    case 'SIGNIN':
      return {
        ...state,
        currentUser: action.user
      }
    case 'SIGNOUT':
      return {
        ...state,
        currentUser: null
      }
    case 'RECEIVE_USERS':
      return {
        ...state,
        users: action.users
      }
    case 'SET_CURRENT_APP_REQUEST':
      return {
        ...state,
        currentAppRequest: action.app
      }
    case 'ADD_APP':
      return {
        ...state,
        apps: [...state.apps, action.app]
      }
    default:
      return state
  }
}

export default masq
