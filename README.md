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

For now we have to specify an env variable with the urls of the signalhubs (signalling server) that will be used.
`
REACT_APP_SIGNALHUB_URLS
`

# Remote webrtc

For Masq app to display a button showing the remote connection link and QR code and possibly use a STUN or TURN server, tou will need to specify the followin env variable.

`
REACT_APP_REMOTE_WEBRTC
`

To be able to connect between different devices, a STUN and TURN server might be needed, ou can set stun and turn servers with the following env variables. Multiple URLs can be specified as a single comma separated string.

`
REACT_APP_STUN_URLS
REACT_APP_TURN_URLS
`
