import React, { Suspense } from 'react'
import { render } from 'react-dom'
import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { Provider } from 'react-redux'

import 'typeface-asap'
import 'typeface-asap-condensed'

/* polyfills */
import 'react-app-polyfill/ie11'
import 'core-js/es7/array'

import './i18n'
import * as serviceWorker from './serviceWorker'
import rootReducer from './reducers'
import App from './App'

import './styles/index.scss'

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  rootReducer,
  composeEnhancer(applyMiddleware(thunkMiddleware))
)

render(
  <Provider store={store}>
    <Suspense fallback='loading'>
      <App />
    </Suspense>
  </Provider>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
