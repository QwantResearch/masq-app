function dbReady (db) {
  return new Promise((resolve, reject) => {
    db.on('ready', () => {
      resolve()
    })
  })
}

function genIV () {
  const ivLen = 16
  const initializationVector = new Uint8Array(ivLen)
  window.crypto.getRandomValues(initializationVector)
  return initializationVector
}

async function encryptMessage (key, data) {
  const strData = JSON.stringify(data)
  const bufferData = Buffer.from(strData, 'utf8')
  const iv = genIV()
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    bufferData)
  const encryptedBase64 = Buffer.from(encrypted).toString('base64')
  const ivBase64 = Buffer.from(iv).toString('base64')
  return JSON.stringify({
    encrypted: encryptedBase64,
    iv: ivBase64
  })
}

async function decryptMessage (key, data) {
  const encryptedJson = JSON.parse(data)
  const iv = Buffer.from(encryptedJson.iv, 'base64')
  const encryptedData = Buffer.from(encryptedJson.encrypted, 'base64')
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encryptedData
  )
  const decryptedDataBuffer = decryptedData
  const decryptedJson = JSON.parse(Buffer.from(decryptedDataBuffer).toString('utf8'))
  return decryptedJson
}

function importKey (rawKey) {
  return new Promise(async (resolve, reject) => {
    try {
      const key = await window.crypto.subtle.importKey(
        'raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
      )
      resolve(key)
    } catch (err) {
      reject(err)
    }
  })
}

export { dbReady, encryptMessage, decryptMessage, importKey }
