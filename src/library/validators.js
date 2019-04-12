const isName = str => /^$|^[A-zÀ-ú\- ]+$/.test(str)

const isUsername = str => /^[\w!?$#@()\-*]+$/.test(str)

const isPassword = str => /^([a-zA-Z\d!?$#@()\-*])+$/.test(str)

const getForce = str => {
  const info = getPasswordInfo(str)
  return str.length < 6 ? 0 : computeScore(info)
}

const isForceEnough = (str) => getForce(str) > 1

const containUppercase = str => /[A-Z]/.test(str)

const containLowercase = str => /[a-z]/.test(str)

const containNumber = str => /[0-9]/.test(str)

const containSpecialCharacter = str => /[!?$#@()\-*]/.test(str)

const getPasswordInfo = str => ({
  lowercase: containLowercase(str),
  uppercase: containUppercase(str),
  number: containNumber(str),
  specialCharacter: containSpecialCharacter(str),
  secureLength: str.length >= 12
})

const computeScore = info => Object.keys(info).reduce((acc, cur) => acc + (info[cur] ? 1 : 0), 0)

export { isName, isUsername, isPassword, getPasswordInfo, getForce, isForceEnough }
