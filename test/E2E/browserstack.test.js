/* eslint-disable no-undef */
describe('BrowserStack Local Testing', function () {
  it('can check tunnel working', function () {
    browser.url('http://bs-local.com:45691/check')
    browser.getPageSource().should.match(/Up and running/i)
  })
})
