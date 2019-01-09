
const isUsernameAlreadyTaken = (username, id) => {
  const ids = Object.keys(window.localStorage)
  if (!ids) return false

  const publicProfiles = ids.map(id => JSON.parse(window.localStorage.getItem(id)))

  return publicProfiles.find(p =>
    (id && p.id === id) ? false : p.username === username
  )
}

export { isUsernameAlreadyTaken }
