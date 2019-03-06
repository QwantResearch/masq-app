module.exports = {
  extends: ['standard', 'standard-react'],
  plugins: ['mocha'],
  env: {
    'mocha': true
  },
  overrides: [{
    files: '*.test.js',
    rules: {
      'no-unused-expressions': 'off'
    }
  }]
}
