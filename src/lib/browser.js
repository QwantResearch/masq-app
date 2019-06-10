import { detect } from 'detect-browser'

const SUPPORTED_BROWSERS = [
  'chrome',
  'firefox',
  'safari'
]

const isBrowserSupported = () => {
  const browser = detect()
  if (!browser) return false
  return !!SUPPORTED_BROWSERS.includes(browser.name)
}

export { isBrowserSupported, SUPPORTED_BROWSERS }
