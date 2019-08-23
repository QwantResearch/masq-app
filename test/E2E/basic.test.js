import Navigation from './Navigation.js'

const pauseTimeShort = 1000
const pauseTimeLong = 3000

describe('Masq : Create a profile', () => {
  const secretKey = 'Helloboys#'
  const username = 'tom'
  it('Should reach the homepage', () => {
    Navigation.open()
  })

  it('Should log ang go to the main page', () => {
    Navigation.pause(pauseTimeShort)
    Navigation.createProfileBtn.click()
    Navigation.usernameInput.setValue(username)
    Navigation.pause(pauseTimeShort)
    Navigation.signupNextBtn.click()
    Navigation.secretKeyInput.setValue(secretKey)
    Navigation.secretKeyConfirmationInput.setValue(secretKey)
    Navigation.pause(pauseTimeShort)
    Navigation.passwordFinishBtn.click()
    Navigation.pause(pauseTimeLong)
  })

  it('Should print the given username', () => {
    const username_ = Navigation.usernameOutput.getText()
    // eslint-disable-next-line no-undef
    expect(username_).to.equal(username)
  })
})
