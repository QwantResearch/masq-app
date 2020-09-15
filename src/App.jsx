import React, { Component } from 'react'

import { End } from './containers'
import { UnsupportedBrowser } from './modals'
import { isBrowserSupported } from './lib/browser'

class App extends Component {
  render () {
    const { unsupportedBrowserModal } = isBrowserSupported()

    if (unsupportedBrowserModal) {
      return <UnsupportedBrowser />
    }

    return <End />
  }
}

export default App
