const { expect } = require('chai')
const { isName, isUsername, isPassword, checkPassword, isForceEnough } = require('../src/library/validators')

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

describe('password validator (check only authoried caracters)', () => {
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

  it('not authorized special caracters are forbidden', () => {
    const str = 'shor%'
    expect(isUsername(str)).to.be.false
  })
})

describe('password rules checker', () => {
  it('should return true if password contains lowercase', () => {
    const str = 'somePassword9$'
    expect(checkPassword(str).lowercase).to.be.true
  })
  it('should return true if password contains uppercase', () => {
    const str = 'somePassword9$'
    expect(checkPassword(str).uppercase).to.be.true
  })
  it('should return true if password contains specialCharacter', () => {
    const str = 'somePassword9$'
    expect(checkPassword(str).specialCharacter).to.be.true
  })
  it('should return true if password contains number', () => {
    const str = 'somePassword9$'
    expect(checkPassword(str).number).to.be.true
  })
  it('should return true if password contains at least 6 characters', () => {
    const str = 'somePassword9$'
    expect(checkPassword(str).minLength).to.be.true
  })
  it('should return true if password contains at least 12 characters', () => {
    const str = 'somePassword9$'
    expect(checkPassword(str).secureLength).to.be.true
  })

  it('should return low for the password force', () => {
    const str = 'some'
    expect(checkPassword(str).force).to.equal('low')
  })
  it('should return low for the password force', () => {
    const str = 'somepa'
    expect(checkPassword(str).force).to.equal('low')
  })
  it('should return medium for the password force', () => {
    const str = 'somEpa'
    expect(checkPassword(str).force).to.equal('medium')
  })
  it('should return low for the password force', () => {
    const str = '145689'
    expect(checkPassword(str).force).to.equal('low')
  })
  it('should return medium for the password force', () => {
    const str = '14568A'
    expect(checkPassword(str).force).to.equal('medium')
  })
  it('should return high for the password force', () => {
    const str = 'somePassword9$'
    expect(checkPassword(str).force).to.equal('high')
  })
})

describe('password force validator', () => {
  it('should accept low + upp', () => {
    const str = 'abcdeF'
    expect(isForceEnough(str)).to.be.true
  })
  it('should accept low + number', () => {
    const str = 'abcde5'
    expect(isForceEnough(str)).to.be.true
  })
  it('should accept low + special', () => {
    const str = 'abcde#'
    expect(isForceEnough(str)).to.be.true
  })
  it('should not accept only low', () => {
    const str = 'abcdef'
    expect(isForceEnough(str)).to.be.false
  })
  it('should not accept only upp', () => {
    const str = 'ABCDEF'
    expect(isForceEnough(str)).to.be.false
  })
  it('should not accept only numbers', () => {
    const str = '123456'
    expect(isForceEnough(str)).to.be.false
  })
  it('should not accept if length < 6', () => {
    const str = '1a#b'
    expect(isForceEnough(str)).to.be.false
  })
})
