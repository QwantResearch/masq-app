
import Compressor from 'compressorjs'
import * as common from 'masq-common'

const { encrypt, decrypt } = common.crypto

const MAX_IMAGE_SIZE = 100000 // 100 KB

const isUsernameAlreadyTaken = (username, id) => {
  const ids = Object
    .keys(window.localStorage)
    .filter(k => k.split('-')[0] === 'profile')

  if (!ids) return false

  const publicProfiles = ids.map(id => JSON.parse(window.localStorage.getItem(id)))

  return publicProfiles.find(p =>
    (id && p.id === id) ? false : p.username === username
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
  peer.send(JSON.stringify(encryptedMsg))
}

const decryptJSON = async (message, key) => (
  decrypt(key, JSON.parse(message), 'base64')
)

const debug = (() => (process.env.NODE_ENV === 'production' ? () => {} : console.log))()

export {
  isUsernameAlreadyTaken,
  compressImage,
  MAX_IMAGE_SIZE,
  waitForPeer,
  capitalize,
  waitForDataFromPeer,
  sendEncryptedJSON,
  decryptJSON,
  debug
}
