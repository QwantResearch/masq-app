const isName = str => /^$|^[A-zÀ-ú\- ]+$/.test(str)

const isUsername = str => /^[\w!?$#@()\-*]+$/.test(str)

const isPassword = str => /^(?=.*\d)(?=.*[!?$#@()\-*]).{8,}$/.test(str)

const containUppercase = str => /[A-Z]/.test(str)

const containLowercase = str => /[a-z]/.test(str)

const containNumber = str => /[0-9]/.test(str)

const containSpecialCharacter = str => /[!?$#@()\-*]/.test(str)

const getPasswordInfo = str => ({
  lowercase: containLowercase(str) ? 1 : 0,
  uppercase: containUppercase(str) ? 1 : 0,
  number: containNumber(str) ? 1 : 0,
  specialCharacter: containSpecialCharacter(str) ? 1 : 0,
  minLength: str.length >= 6 ? 6 : 0,
  secureLength: str.length >= 12 ? 12 : 0
})

const computeScore = info => Object.keys(info).reduce((acc, cur) => acc + info[cur], 0)

const checkPassword = str => {
  const info = getPasswordInfo(str)
  const score = computeScore(info)
  let force = null
  if (score === 22) {
    force = 'high'
  } else if (score >= 8) {
    force = 'medium'
  } else force = 'low'
  return { ...info, force }
}

export { isName, isUsername, isPassword, checkPassword }
