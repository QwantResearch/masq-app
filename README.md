# Masq-app

[![Build Status](https://travis-ci.org/QwantResearch/masq-app.svg?branch=master)](https://travis-ci.org/QwantResearch/masq-app)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

`Masq-app` is the web application that synchronizes and protects you data between your devices.

## Development

```bash
npm install
npm start
```

## Deploy to Github pages

```bash
npm install
npm run deploy
```

## Production

To deploy in production:

- Edit `.env.production` to point to the correct signalhubws server(s)
- Set the `homepage` field in `package.json` to point to the url where masq-app will be accessible, then run:

```bash
npm install
npm run build
```

Then deploy the static files in the `build/` folder.

## Environment variables

For now, we have to specify an env variable with the urls of the signalhubs (signalling server) that will be used.
`
REACT_APP_SIGNALHUB_URLS
`

## Remote webrtc

For Masq app to display a button showing the remote connection link and QR code and possibly use a STUN or TURN server, you will need to specify the following env variable.

`
REACT_APP_REMOTE_WEBRTC
`

To be able to connect between different devices, a STUN and TURN server might be needed, ou can set stun and turn servers with the following env variables. Multiple URLs can be specified as a single comma separated string.

`
REACT_APP_STUN_URLS
REACT_APP_TURN_URLS
`

## Browser test

Automated test using webdriverIO and browserstack

### config

The .env.test file contains different configuration variables dedicated to browser test :

- E2E_DELAY_TIME=true/false : add (if true) breaks between each steps for a human readable view
- BROWSERSTACK_USERNAME : the username for browserstack
- BROWSERSTACK_ACCESS_KEY : the access key for browserstack
- BROWSERSTACK_DEVICE_GROUP_NAME : the device group name (all, windows, macMojave, macHighSierra)

### Run

We need to distinguish two parts for each test:

- where is Masq-app running, what do we want to test (localhost, plive, prod ...)
- where is executed the selenium test (locally or on Browserstack)

In order to facilitate tests, we create scripts in package.json.

#### Full local version

This case is where both masq-app and the test are run locally, this is typically the most used configuration during development.

To run the test :

- launch masq-app locally (localhost:3000)
- execute *npm run test:local*

#### Local browserstack

In this test, Masq-app is run locally, but the test is done through Browserstack. This configuration is useful if we want to test our code within differnet OS, browsers quickly.

To run the test :

- execute *npm run test:browserstack:local*, masq-app is launched automatically

#### Full browserstack

If we want to test a deployed version of Masq-app, we can use this configuration. We do not need to run anything locally.

To run the test :

- deploy masq and update baseUrl in *conf/prod.conf.js*
- execute *npm run test:browserstack:prod*
