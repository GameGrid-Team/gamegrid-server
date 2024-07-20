const express = require('express')
const Joi = require('joi')

const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')

const app = express()
app.use(express.json())
const generalTexts = require('./fixture/general_text')
let db


const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Listening on port ${port}`))

app.get('/api/about', (req, res) => {
  res.json([generalTexts.aboutTxt])
})
app.get('/api/ping', (req, res) => {
  res.json(['pong I LOVE U'])
})


app.post('/api/users', (req, res) => {
  if (!req.body.email) {
    res.status(400).json({"error":"nickname is empty!" })
    return
  }
  const user = {
    email: req.body.email,
    password: req.body.password,
  }
  res.status(200).json(user)
})
