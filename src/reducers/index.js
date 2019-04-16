import { combineReducers } from 'redux'
import masq from './masq'
import notification from './notification'
import loading from './loading'

export default combineReducers({
  masq,
  notification,
  loading
})
