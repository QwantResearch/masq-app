const notification = (state = {
  currentNotification: null // { title: 'test', error: true }
}, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATION':
      return {
        ...state,
        currentNotification: action.notification
      }
    default:
      return state
  }
}

export default notification
