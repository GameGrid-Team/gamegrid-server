const express = require('express')
const Joi = require('joi')
var cors = require('cors')

const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')

const app = express()
app.use(express.json())
const generalTexts = require('./fixture/general_text')
let db

app.use(cors())

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Listening on port ${port}`))

app.get('/api/about', (req, res) => {
  res.send([generalTexts.aboutTxt])
})
app.get('/api/ping', (req, res) => {
  res.send(['pong I LOVE U'])
})
