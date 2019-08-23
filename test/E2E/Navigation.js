/* eslint-disable no-undef */
import conf from '../../wdio.conf.js'

class Navigation {
  get createProfileBtn () {
    return $('#create-account-btn')
  }
  get signupNextBtn () {
    return $('#signup-next-btn')
  }
  get passwordFinishBtn () {
    return $('#password-finish-btn')
  }
  get usernameInput () {
    return $('#signup-username-input')
  }
  get usernameOutput () {
    return $('#navbar-username-output')
  }
  get secretKeyInput () {
    return $('#secret-key-input')
  }
  get secretKeyConfirmationInput () {
    return $('#secret-key-confirmation-input')
  }
  open (path) {
    if (!path) {
      browser.url('/')
    } else {
      browser.url(path)
    }
  }
  pause (time) {
    if (conf.config.demo === 'true') {
      console.log('pause....', time)
      browser.pause(time)
    }
  }
}

export default new Navigation()
