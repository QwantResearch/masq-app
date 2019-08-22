const webpack = require('webpack')

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: ['test/*.js'],
    reporters: ['progress'],
    port: 9876, // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
    preprocessors: {
      'test/**/*.js': ['webpack', 'sourcemap']
    },
    webpack: {
      mode: 'development',
      node: {
        fs: 'empty'
      },
      plugins: [
        new webpack.EnvironmentPlugin({
          NODE_ENV: 'test'
        })
      ]
    },
    webpackMiddleware: {
      stats: 'errors-only',
      devtool: 'inline-source-map'
    },
    browserDisconnectTimeout: 60000,
    browserNoActivityTimeout: 60000
  })
}
