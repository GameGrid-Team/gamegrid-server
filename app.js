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

app.get('/api/users', (req, res) => {
  let users = []
  db.collection('users')
    .find()
    .ni.forEach((user) => {
      users.push(user)
      if (user.nickname === 'naruto') console.log('User:::::: ', user)
    })
    .then(() => {
      res.status(200).json(users)
    })
    .catch(() => {
      res.status(500).json({ error: "Couldn't find users from list" })
    })
})

app.get('/api/about', (req, res) => {
  res.json({ aboutText: generalTexts.aboutTxt })
})
app.get('/api/ping', (req, res) => {
  res.json(['pong I LOVE U'])
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
