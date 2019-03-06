const { expect } = require('chai')
const { isName, isUsername, isPassword } = require('../src/library/validators')

describe('name validator', () => {
  it('should be valid', () => {
    const str = 'someName'
    expect(isName(str)).to.be.true
  })

  it('empty is allowed', () => {
    expect(isName('')).to.be.true
  })

  it('spaces are allowed', () => {
    const str = 'some name'
    expect(isName(str)).to.be.true
  })

  it('accents are allowed', () => {
    const str = 'some name é'
    expect(isName(str)).to.be.true
  })

  it('numbers are forbidden', () => {
    const str = 'some name 2'
    expect(isName(str)).to.be.false
  })

  it('special characters are forbidden', () => {
    const str = 'some name$'
    expect(isName(str)).to.be.false
  })
})

describe('username validator', () => {
  it('should be valid', () => {
    const str = 'someUsername'
    expect(isUsername(str)).to.be.true
  })

  it('empty is forbidden', () => {
    expect(isUsername('')).to.be.false
  })

  it('accents are forbidden', () => {
    expect(isUsername('é')).to.be.false
  })

  it('spaces are not allowed', () => {
    const str = 'some username'
    expect(isUsername(str)).to.be.false
  })

  it('numbers are allowed', () => {
    const str = 'someUsername75'
    expect(isUsername(str)).to.be.true
  })

  it('special characters are allowed', () => {
    const str = 'someUsername$'
    expect(isUsername(str)).to.be.true
  })
})

describe('password validator', () => {
  it('should be valid', () => {
    const str = 'somePassword9$'
    expect(isPassword(str)).to.be.true
  })

  it('empty is forbbiden', () => {
    expect(isPassword('')).to.be.false
  })

  it('spaces are forbidden', () => {
    const str = 'some Password9$'
    expect(isUsername(str)).to.be.false
  })

  it('less than 8 characters is forbidden', () => {
    const str = 'short8$'
    expect(isPassword(str)).to.be.false
  })

  it('without at least one number is forbidden', () => {
    const str = 'somepassword$'
    expect(isPassword(str)).to.be.false
  })

  it('without at least one special character is forbidden', () => {
    const str = 'somepassword9'
    expect(isPassword(str)).to.be.false
  })
})
