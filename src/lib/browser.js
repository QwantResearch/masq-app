import { detect } from 'detect-browser'

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

export {
  isBrowserSupported,
  SUPPORTED_BROWSERS,
  SUPPORTED_BROWSERS_CODES
}
