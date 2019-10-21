
import Compressor from 'compressorjs'
import * as common from 'masq-common'
import fetch from 'node-fetch'

const { encrypt, decrypt } = common.crypto

const MAX_IMAGE_SIZE = 100000 // 100 KB

const postLog = async (log) => {
  if (process.env.REACT_APP_LOG_ENDPOINT) {
    try {
      debug(`Send log ${JSON.stringify(log)} to ${process.env.REACT_APP_LOG_ENDPOINT}`)
      const response = await fetch(process.env.REACT_APP_LOG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          log
        })
      })
      const data = await response.json()
      return data.log
    } catch (error) {
      console.error('Error to post log ', log)
    }
  } else {
    debug('No endpoint provided, please update REACT_APP_LOG_ENDPOINT in .env')
    return log
  }
}

const isUsernameAlreadyTaken = (username, id) => {
  const ids = Object
    .keys(window.localStorage)
    .filter(k => k.split('-')[0] === 'profile')

  if (!ids) return false

  const publicProfiles = ids.map(id => JSON.parse(window.localStorage.getItem(id)))

  const _username = username.toUpperCase()
  return publicProfiles.find(p =>
    (id && p.id === id) ? false : p.username.toUpperCase() === _username
  )
}

const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const image = new Compressor(file, { // eslint-disable-line no-unused-vars
      quality: 0.8,
      width: 512,
      height: 512,
      convertSize: 0,
      success (result) {
        resolve(result)
      },
      error (err) {
        reject(err.message)
      }
    })
  })
}

const capitalize = (string) => (
  string.charAt(0).toUpperCase() + string.slice(1)
)

const waitForDataFromPeer = (peer) => (
  new Promise((resolve) => {
    peer.once('data', (data) => {
      resolve(data)
    })
  })
)

const waitForPeer = (sw) => (
  new Promise((resolve) => {
    sw.once('peer', (peer) => {
      resolve(peer)
    })
  })
)

const sendEncryptedJSON = async (json, key, peer) => {
  const encryptedMsg = await encrypt(key, json, 'base64')
  if (!peer) throw new Error('peer does not exist')
  peer.send(JSON.stringify(encryptedMsg))
}

const decryptJSON = async (message, key) => (
  decrypt(key, JSON.parse(message), 'base64')
)

const dispatchMasqError = (errorCode) => {
  const event = new window.CustomEvent('MasqError', {
    detail: errorCode
  })
  window.dispatchEvent(event)
}

const debug = (() => (process.env.NODE_ENV === 'production' ? () => {} : console.log))()

const promiseTimeout = function (ms, promise) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error('timeout'))
    }, ms)
  })

  // Returns a race between our timeout and the passed in promise
  return Promise.race([
    promise,
    timeout
  ])
}

export {
  isUsernameAlreadyTaken,
  promiseTimeout,
  postLog,
  compressImage,
  MAX_IMAGE_SIZE,
  waitForPeer,
  capitalize,
  waitForDataFromPeer,
  sendEncryptedJSON,
  decryptJSON,
  debug,
  dispatchMasqError
}
