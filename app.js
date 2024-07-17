const express = require('express')
const Joi = require('joi')
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')
const app = express()
app.use(express.json())

let db

connectToDb((err) => {
  if (!err) {
    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`Listening on port ${port}`))
    db = getDb()
  }
})

// routs
app.get('/', (req, res) => {
  res.send('helloooooo world')
})

app.get('/api/users', (req, res) => {
  let users = []
  db.collection('users')
    .find()
    .forEach((user) => {
      users.push(user)
      console.log(`User ${user}`)
    })
    .then(() => {
      res.status(200).json(users)
    })
    .catch(() => {
      res.status(500).json({ error: "Couldn't find users from list" })
    })
})

// app.get('/api/users/:user_id', (req, res) => {
//   const user = users.find((u) => u.user_id === req.params.user_id.toString())
//   if (!user) res.status(404).send('User with given user_id was not found')
//   res.send(user)
// })

// app.post('/api/users', (req, res) => {
// const schema = {
//   name: Joi.string().min(3).required(),
// }
// const result = Joi.validate(req.body, schema)
// if (result.error) {
//   res.status(400).send(result.error)
//   return
// }

app.post('/api/users', (req, res) => {
  if (!req.body.nickname || req.body.nickname.length < 3) {
    res.status(400).send('Name is required be min of 3 characters')
    return
  }
  const user = {
    user_id: users.length + 1,
    nickname: req.body.nickname,
  }
  users.push(user)
  res.send(user)
})

// Template for users db