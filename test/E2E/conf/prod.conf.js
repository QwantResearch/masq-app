const getCapabilities = require('./capabilities')
const master = require('../../../wdio.conf')
require('dotenv').config({ path: '.env.test' })

exports.config = Object.assign(master.config, {
  demo: process.env.E2E_DELAY_TIME || 'false',
  user: process.env.BROWSERSTACK_USERNAME || 'user',
  key: process.env.BROWSERSTACK_ACCESS_KEY || 'key',
  baseUrl: 'https://masq.qwant.com',
  specs: ['./test/E2E/*.test.js'],
  path: '/wd/hub',
  logLevel: 'warn',
  suites: {
    e2e: ['./test/E2E/basic.test.js']
  },
  reporters: ['spec'],
  services: ['browserstack'],

  capabilities: getCapabilities()
})
