import { combineReducers } from 'redux'
import masq from './masq'
import notification from './notification'

export default combineReducers({
  masq,
  notification
})
