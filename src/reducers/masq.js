const masq = (state = {
  syncStep: '',
  users: [],
  apps: [],
  devices: [],
  currentUser: null,
  currentAppRequest: null
}, action) => {
  switch (action.type) {
    case 'SIGNIN':
      return { ...state, currentUser: action.profile }
    case 'SIGNOUT':
      return { ...state, currentUser: null }
    case 'RECEIVE_USERS':
      return { ...state, users: action.users }
    case 'RECEIVE_APPS':
      return { ...state, apps: action.apps }
    case 'RECEIVE_DEVICES':
      return { ...state, devices: action.devices }
    case 'SET_CURRENT_APP_REQUEST':
      return { ...state, currentAppRequest: action.app }
    case 'UPDATE_CURRENT_APP_REQUEST':
      return { ...state, currentAppRequest: { ...state.currentAppRequest, ...action.update } }
    case 'ADD_APP':
      return { ...state, apps: [...state.apps, action.app] }
    case 'ADD_DEVICE':
      return { ...state, devices: [...state.devices, action.device] }
    case 'SET_SYNC_STEP':
      return { ...state, syncStep: action.syncStep }
    default:
      return state
  }
}

export default masq
