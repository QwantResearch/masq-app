module.exports = {
  extends: ['standard', 'standard-react'],
  plugins: ['mocha'],
  env: {
    'mocha': true
  },
  overrides: [{
    files: '*.test.js',
    rules: {
      'no-unused-expressions': 'off',
      'import/first': 'off'
    }
  }],
  settings: {
    react: {
      version: "detect"
    }
  }
}
