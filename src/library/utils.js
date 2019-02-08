import Compressor from 'compressorjs'
const isUsernameAlreadyTaken = (username, id) => {
  const ids = Object.keys(window.localStorage)
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
      width: 200,
      height: 200,
      success (result) {
        resolve(result)
      },
      error (err) {
        reject(err.message)
      }
    })
  })
}

export { isUsernameAlreadyTaken, compressImage }
