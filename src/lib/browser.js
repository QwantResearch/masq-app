import { detect } from 'detect-browser'

const SUPPORTED_BROWSERS = [
  'firefox',
  'brave', // brave will be detected as chrome
  'chrome',
  'safari'
]

const isBrowserSupported = () => {
  const browser = detect()
  if (!browser) return false
  return !!SUPPORTED_BROWSERS.includes(browser.name)
}

export { isBrowserSupported, SUPPORTED_BROWSERS }
