// import multer from 'multer'
const express = require('express')
const Joi = require('joi')
const cors = require('cors')
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')
const app = express()
const general = require('./fixture/general_text')
const multer = require('multer')
app.use(express.json())
app.use(cors())
let db

connectToDb((err) => {
  if (!err) {
    const port = process.env.PORT || 3001
    app.listen(port, () => console.log(`Listening on port ${port}`))
    db = getDb()

    app.use('/api/users', require('./routes/users')(db))
    app.use('/api/posts', require('./routes/posts')(db))
    app.use('/api/login', require('./routes/login')(db))
  }
})

//Get about page text
app.get('/api/about', (req, res) => {
  res.json({ aboutText: general.aboutTxt })
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
