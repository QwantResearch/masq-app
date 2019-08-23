const getCapabilities = require('./capabilities')
const master = require('../../../wdio.conf')
const browserstack = require('browserstack-local')
require('dotenv').config({ path: '.env.test' })

exports.config = Object.assign(master.config, {
  baseUrl: 'http://localhost:3000',
  user: process.env.BROWSERSTACK_USERNAME || 'user',
  key: process.env.BROWSERSTACK_ACCESS_KEY || 'key',
  demo: 'false',
  logLevel: 'info',
  path: '/wd/hub',
  suites: {
    e2e: [
      // './test/E2E/browserstack.test.js',
      './test/E2E/basic.test.js'
    ]
  },
  reporters: ['spec'],
  maxInstances: 2,
  services: ['browserstack'],
  capabilities: getCapabilities(),

  // Code to start browserstack local before start of test
  onPrepare: function (config, capabilities) {
    console.log('Connecting local')
    return new Promise((resolve, reject) => {
      exports.bs_local = new browserstack.Local()
      if (!exports.bs_local.isRunning()) {
        exports.bs_local.start({ 'key': exports.config.key }, function (error) {
          if (error) return reject(error)
          console.log('Connected. Now testing...')
          resolve()
        })
      }
      console.log('browserstack local is already running')
      resolve()
    })
  },

  // Code to stop browserstack local after end of test
  onComplete: function (capabilties, specs) {
    exports.bs_local.stop(function () { })
  }
})
