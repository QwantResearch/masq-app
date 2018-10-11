const masq = (state = { user: null, users: [] }, action) => {
  console.log(action.type)
  switch (action.type) {
    case 'ADD_USER':
      console.log('ADD_USER', action.user)
      return {
        ...state,
        users: [...state.users, action.user],
        user: action.user
      }
    case 'RECEIVE_USERS':
      console.log('RECEIVE_USERS')
      return {
        ...state,
        users: action.users
      }
    default:
      return state
  }
}

export default masq
