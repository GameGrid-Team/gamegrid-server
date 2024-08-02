const express = require('express')
const Joi = require('joi')
const cors = require('cors')
const multer = require('multer')
const { connectToDb, getDb, fbapp } = require('./db')
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

// app.post('/api/uploadfile', upload.single('image'), async (req, res) => {
//   try {
//     const dateTime = giveCurrentDateTime()
//     const storageRef = ref(storage, `files/${req.file.originalname + '       ' + dateTime}`)
//     const metadata = {
//       contentType: req.file.mimetype,
//     }
//     const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata)
//     const downloadURL = await getDownloadURL(snapshot.ref)
//     console.log('File successfully uploaded.')
//     console.log(downloadURL)
//     return res.send({
//       message: 'file uploaded to firebase storage',
//       name: req.file.originalname,
//       type: req.file.mimetype,
//       downloadURL: downloadURL,
//     })
//   } catch (error) {
//     return res.status(400).send(error.message)
//   }
// })

// const giveCurrentDateTime = () => {
//   const today = new Date()
//   const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
//   const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds()
//   const dateTime = date + ' ' + time
//   return dateTime
// }

// app.post('/api/file', upload.single('image'), async (req, res) => {
//   console.log('body::: ', req.body)
//   console.log('file:::', req.file)
//   const file = req.file.buffer

//   res.send({})
// })
