const express = require('express')
const Joi = require('joi')
const cors = require('cors')
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')
const app = express()
app.use(express.json())
const generalTexts = require('./fixture/general_text')
let db

connectToDb((err) => {
  if (!err) {
    const port = process.env.PORT || 3001
    app.listen(port, () => console.log(`Listening on port ${port}`))
    db = getDb()
  }
})
// const port = process.env.PORT || 3001
// app.listen(port, () => console.log(`Listening on port ${port}`))

app.use(cors())

app.post('/api/users', (req, res) => {
  let errors = { errors: [] }
  let flagNick = 0
  let flagEmail = 0
  const reqUser = req.body
  const nickname = reqUser.nickname
  const email = reqUser.email
  const usersDB = db.collection('users')
  console.log(`User ${nickname}`)

  usersDB
    .find()
    .forEach((user) => {
      console.log('User', user)
      if (user.nickname === nickname) {
        errors.errors.push({ message: 'Nickname is taken', field: 'nickname' })
        flagNick = 1
      }
      if (user.email === email) {
        errors.errors.push({ message: 'Email is taken', field: 'email' })
        flagEmail = 1
      }
    })
    .then(() => {
      if (flagEmail + flagNick) {
        res.status(404).json(errors)
      } else {
        res.status(200).json(user)
      }
    })
    .catch(() => {
      res.status(500).json({ error: "Couldn't connect to DB" })
    })
})

app.get('/api/about', (req, res) => {
  res.json({ aboutText: generalTexts.aboutTxt })
})
app.get('/api/ping', (req, res) => {
  res.json(['pong I LOVE U 7'])
})

app.post('/api/login', (req, res) => {
  if (!req.body.email) {
    res.status(400).json({ error: 'Name is required be' })
    return
  }
  const user = {
    email: req.body.email,
    password: req.body.password,
  }
  res.status(200).json(user)
})
