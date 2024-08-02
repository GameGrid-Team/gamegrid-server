const express = require('express')
const Joi = require('joi')
const cors = require('cors')
const multer = require('multer')
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')
const app = express()
const general = require('./fixture/general_text')
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

// app.post('/api/file', upload.single('image'), async (req, res) => {
//   console.log('body::: ', req.body)
//   console.log('file:::', req.file)
//   const file = req.file.buffer

//   res.send({})
// })
