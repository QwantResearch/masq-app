import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'

import 'typeface-asap'
import 'typeface-asap-condensed'

/* polyfills */
import 'react-app-polyfill/ie11'
import 'core-js/es/array'

import './i18n'
import * as serviceWorker from './serviceWorker'
import rootReducer from './reducers'
import App from './App'

import './styles/index.scss'

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = (() => {
  const store = createStore(
    rootReducer,
    composeEnhancer(applyMiddleware(thunkMiddleware))
  )

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      store.replaceReducer(rootReducer)
    })
  }

  return store
})()

const render = () => ReactDOM.render(
  <Provider store={store}>
    <Suspense fallback='loading'>
      <App />
    </Suspense>
  </Provider>,
  document.getElementById('root')
)

render()

if (module.hot) {
  module.hot.accept('./App', () => {
    render()
  })
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
