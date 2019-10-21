const express = require('express')
const cors = require('cors')

const app = express()
const port = 3010
const maxBodySize = 150
const allowedOrigins = [
  'http://localhost:3000',
  'https://masq.qwant.com']

const authorizedEvents = [
  'click_selectUser',
  'click_handleOpenSignup'
]

const authorizedLog = (log) => {
  if (log.type && authorizedEvents.includes(log.type)) { return true }
  return false
}

app.use(cors({
  origin: function (origin, callback) { // allow requests with no origin
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true); if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(new Error(msg), false)
    } return callback(null, true)
  }
}))

app.listen(port, () => console.log(`Masq app listening on port ${port}!`))

app.post('/logs',
  express.json({ strict: true, limit: maxBodySize }),
  (req, res) => {
    console.log(req.body.log)
    if (authorizedLog(req.body.log)) {
      res.json(req.body)
    } else {
      res.sendStatus(400)
    }
  })
