const isName = str => /^$|^[A-zÀ-ú\- ]+$/.test(str)

const isUsername = str => /^[\w!?$#@()\-*]+$/.test(str)

const isPassword = str => /^(?=.*\d)(?=.*[!?$#@()\-*]).{8,}$/.test(str)

export { isName, isUsername, isPassword }
