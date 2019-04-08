const isName = str => /^$|^[A-zÀ-ú\- ]+$/.test(str)

const isUsername = str => /^[\w!?$#@()\-*]+$/.test(str)

const isPassword = str => /^([a-zA-Z\d!?$#@()\-*])+$/.test(str)

const isForceEnough = str => {
  const { force } = checkPassword(str)
  return force !== 'low'
}

const containUppercase = str => /[A-Z]/.test(str)

const containLowercase = str => /[a-z]/.test(str)

const containNumber = str => /[0-9]/.test(str)

const containSpecialCharacter = str => /[!?$#@()\-*]/.test(str)

const getPasswordInfo = str => ({
  minLength: str.length >= 6,
  lowercase: containLowercase(str),
  uppercase: containUppercase(str),
  number: containNumber(str),
  specialCharacter: containSpecialCharacter(str),
  secureLength: str.length >= 12
})

const computeScore = info => Object.keys(info).reduce((acc, cur) => acc + (info[cur] ? 1 : 0), 0)

const checkPassword = str => {
  const info = getPasswordInfo(str)
  const score = computeScore(info)

  let force = null
  if (score === Object.keys(info).length) {
    force = 'high'
  } else if (score >= 3 && (str.length >= 6)) {
    force = 'medium'
  } else force = 'low'
  return { ...info, force }
}

export { isName, isUsername, isPassword, checkPassword, isForceEnough }
