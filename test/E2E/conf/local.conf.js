const master = require('../../../wdio.conf')
const uuidv4 = require('uuid/v4')
require('dotenv').config({ path: '.env.test' })
const chromePath = require('puppeteer').executablePath()

const tmpDir = '/tmp/.chrome/' + uuidv4()

exports.config = Object.assign(master.config, {
  services: ['chromedriver'],
  demo: process.env.E2E_DELAY_TIME || 'false',
  baseUrl: 'http://localhost:3000',
  specs: ['./test/E2E/*.test.js'],
  logLevel: 'warn',
  suites: {
    e2e: ['./test/E2E/basic.test.js']
  },
  reporters: ['spec'],
  maxInstances: 2,
  capabilities: [{
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: ['--disable-infobars', '--user-data-dir=' + tmpDir],
      binary: chromePath
    }
  }]
})
