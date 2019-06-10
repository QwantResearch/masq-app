import * as sinon from 'sinon'
import DetectBrowser from 'detect-browser'

import { isBrowserSupported, SUPPORTED_BROWSERS } from '../src/lib/browser'

const { expect } = require('chai')

describe('Browser support', () => {
  let stub = null

  const stubBrowser = (name) => {
    stub = sinon
      .stub(DetectBrowser, 'detect')
      .callsFake(() => ({ name }))
  }

  afterEach(() => {
    stub.restore()
  })

  it('should return true for browsers in whitelist', () => {
    SUPPORTED_BROWSERS.forEach((browser) => {
      stubBrowser(browser)
      expect(isBrowserSupported()).to.be.true
      stub.restore()
    })
  })

  it('should return false for non-whitelisted browsers', () => {
    stubBrowser('ie')
    expect(isBrowserSupported()).to.be.false
  })

  it('should return false for non-detected browsers', () => {
    stub = sinon
      .stub(DetectBrowser, 'detect')
      .callsFake(() => null)

    expect(isBrowserSupported()).to.be.false
  })
})
