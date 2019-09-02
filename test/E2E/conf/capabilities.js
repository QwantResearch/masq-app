const listAllCapabilitites = {
  android: [
    {
      project: 'Masq',
      os_version: '7.0',
      device: 'Samsung Galaxy S8',
      real_mobile: 'true',
      'browserstack.local': true,
      'browserstack.debug': true
    },
    {
      project: 'Masq',
      os_version: '8.0',
      device: 'Samsung Galaxy S9',
      real_mobile: 'true',
      'browserstack.local': true,
      'browserstack.debug': true
    },
    {
      project: 'Masq',
      os_version: '9.0',
      device: 'Samsung Galaxy S10e',
      real_mobile: 'true',
      'browserstack.local': true,
      'browserstack.debug': true
    }

  ],
  windows: [
    {
      project: 'Masq',
      browserName: 'Chrome',
      browser_version: '76.0',
      resolution: '1920x1080',
      os: 'Windows',
      os_version: '10',
      'browserstack.local': true,
      'browserstack.debug': true
    },
    {
      project: 'Masq',
      browserName: 'Firefox',
      browser_version: '68.0',
      resolution: '1920x1080',
      os: 'Windows',
      os_version: '10',
      'browserstack.local': true,
      'browserstack.debug': true
    }
  ],
  macHighSierra: [
    {
      project: 'Masq',
      os: 'OS X',
      os_version: 'High Sierra',
      browserName: 'Safari',
      browser_version: '11.0',
      resolution: '1920x1080',
      'browserstack.selenium_version': '3.10.0',
      'browserstack.local': true,
      'browserstack.debug': true
    },
    {
      project: 'Masq',
      os: 'OS X',
      os_version: 'High Sierra',
      browserName: 'Chrome',
      browser_version: '76.0',
      resolution: '1920x1080',
      'browserstack.selenium_version': '3.5.2',
      'browserstack.local': true,
      'browserstack.debug': true
    },
    {
      project: 'Masq',
      os: 'OS X',
      os_version: 'High Sierra',
      browserName: 'Firefox',
      browser_version: '68.0',
      resolution: '1920x1080',
      'browserstack.selenium_version': '3.10.0',
      'browserstack.local': true,
      'browserstack.debug': true
    }
  ],
  macMojave: [
    {
      project: 'Masq',
      os: 'OS X',
      os_version: 'Mojave',
      browserName: 'Safari',
      browser_version: '12.0',
      resolution: '1920x1080',
      'browserstack.selenium_version': '3.14.0',
      'browserstack.local': true,
      'browserstack.debug': true
    },
    {
      project: 'Masq',
      os: 'OS X',
      os_version: 'Mojave',
      browserName: 'Chrome',
      browser_version: '76.0',
      resolution: '1920x1080',
      'browserstack.selenium_version': '3.5.2',
      'browserstack.local': true,
      'browserstack.debug': true
    },
    {
      project: 'Masq',
      os: 'OS X',
      os_version: 'Mojave',
      browserName: 'Firefox',
      browser_version: '68.0',
      resolution: '1920x1080',
      'browserstack.selenium_version': '3.10.0',
      'browserstack.local': true,
      'browserstack.debug': true
    }
  ]
}

const getCapabilities = () => {
  if (process.env.BROWSERSTACK_DEVICE_GROUP_NAME in listAllCapabilitites) {
    console.log(`Test ${process.env.BROWSERSTACK_DEVICE_GROUP_NAME} devices`)
    return listAllCapabilitites[process.env.BROWSERSTACK_DEVICE_GROUP_NAME]
  }
  // in case of group name error , test all devices
  console.log('Test ALL devices')
  return Object.keys(listAllCapabilitites).map(key => listAllCapabilitites[key]).reduce((a, b) => a.concat(b), [])
}

module.exports = getCapabilities
