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
