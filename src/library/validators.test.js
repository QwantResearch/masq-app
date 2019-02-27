import {
  isName,
  isUsername,
  isPassword
} from './validators'

describe('name validator', () => {
  test('should be valid', () => {
    const str = 'someName'
    expect(isName(str)).toBe(true)
  })

  test('empty is allowed', () => {
    expect(isName('')).toBe(true)
  })

  test('spaces are allowed', () => {
    const str = 'some name'
    expect(isName(str)).toBe(true)
  })

  test('accents are allowed', () => {
    const str = 'some name é'
    expect(isName(str)).toBe(true)
  })

  test('numbers are forbidden', () => {
    const str = 'some name 2'
    expect(isName(str)).toBe(false)
  })

  test('special characters are forbidden', () => {
    const str = 'some name$'
    expect(isName(str)).toBe(false)
  })
})

describe('username validator', () => {
  test('should be valid', () => {
    const str = 'someUsername'
    expect(isUsername(str)).toBe(true)
  })

  test('empty is forbidden', () => {
    expect(isUsername('')).toBe(false)
  })

  test('accents are forbidden', () => {
    expect(isUsername('é')).toBe(false)
  })

  test('spaces are not allowed', () => {
    const str = 'some username'
    expect(isUsername(str)).toBe(false)
  })

  test('numbers are allowed', () => {
    const str = 'someUsername75'
    expect(isUsername(str)).toBe(true)
  })

  test('special characters are allowed', () => {
    const str = 'someUsername$'
    expect(isUsername(str)).toBe(true)
  })
})

describe('password validator', () => {
  test('should be valid', () => {
    const str = 'somePassword9$'
    expect(isPassword(str)).toBe(true)
  })

  test('empty is forbbiden', () => {
    expect(isPassword('')).toBe(false)
  })

  test('spaces are forbidden', () => {
    const str = 'some Password9$'
    expect(isUsername(str)).toBe(false)
  })

  test('less than 8 characters is forbidden', () => {
    const str = 'short8$'
    expect(isPassword(str)).toBe(false)
  })

  test('without at least one number is forbidden', () => {
    const str = 'somepassword$'
    expect(isPassword(str)).toBe(false)
  })

  test('without at least one special character is forbidden', () => {
    const str = 'somepassword9'
    expect(isPassword(str)).toBe(false)
  })
})
