import { detect } from 'detect-browser'
import { utils } from 'masq-common'

const { dbExists } = utils

const SUPPORTED_BROWSERS_CODES = [
  'firefox',
  'chrome',
  'safari',
  'ios',
  'android',
  'crios',
  'fxios',
  'samsung'
]

// Recommended browsers displayed in the modal
// if the current browser is unsupported
const SUPPORTED_BROWSERS = [
  'firefox',
  'brave', // brave will be detected as chrome
  'chrome',
  'safari'
]

const isBrowserSupported = () => {
  const browser = detect()
  if (!browser) return false
  return !!SUPPORTED_BROWSERS_CODES.includes(browser.name)
}

const isBrowserStorageAvailable = () => {
  return new Promise(async (resolve, reject) => {
    try {
      await dbExists('testPrivateBrowsing')
      resolve(true)
    } catch (err) {
      resolve(false)
    }
  })
}

export {
  isBrowserSupported,
  isBrowserStorageAvailable,
  SUPPORTED_BROWSERS,
  SUPPORTED_BROWSERS_CODES
}
