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

//insert user
app.post('/api/user/insert', (req, res) => {
  let err = { error: 'the value of the fields equal to 1 are taken', emailCheck: 0, nickCheck: 0 }
  const reqUser = req.body
  const nickname = reqUser.nickname
  const email = reqUser.email
  const usersDB = db.collection('users')

  usersDB
    .find()
    .forEach((user) => {
      console.log('User', user)
      if (user.nickname === nickname) {
        err.nickCheck = 1
      }
      if (user.email === email) {
        err.emailCheck = 1
      }
    })
    .then(() => {
      if (err.emailCheck === 1 || err.nickCheck === 1) {
        res.status(404).json(err)
      } else {
        usersDB.insertOne(reqUser)
        res.status(200).json(reqUser)
      }
    })
    .catch(() => {
      res.status(500).json({ error: "Couldn't onnect to DB" })
    })
})

//user deletion
app.delete('/api/user/:id/delete', (req, res) => {
  let err = { error: 'user does not exist' }
  const userID = req.params.id
  const usersDB = db.collection('users')

  usersDB
    .deleteOne({ _id: new ObjectId(userID) })
    .then(() => {
      res.status(200).json({ message: 'User Removed Successfully' })
    })
    .catch(() => {
      res.status(404).json(err)
    })
})

//update user
app.post('/api/user/:id/update', (req, res) => {
  const userID = req.params.id
  const usersDB = db.collection('users')

  usersDB
    .updateOne({ _id: new ObjectId(userID) }, { $set: req.body })
    .then(() => {
      res.status(200).json({ message: 'User Updated Successfully' })
    })
    .catch(() => {
      res.status(404).json({ error: 'Update Failed' })
    })
})
// delete post

//user login
app.get('/api/login', (req, res) => {
  //{email: #####,pass:#######}/{nickname: #####,pass:#######}
  const { email, nickname, password } = req.query
  let filter = { password }
  if (email) filter.email = email
  if (nickname) filter.nickname = nickname
  const usersDB = db.collection('users')

  usersDB
    .findOne(filter)
    .then((user) => {
      res.status(200).json({ userid: user._id.toString(), message: 'login successful' })
    })
    .catch(() => {
      res.status(404).json({ error: 'Login Failed' })
    })
})
//Insert post
app.post('/api/users/:id/post/insert', (req, res) => {
  let err = { error: 'Faild to upload post' }
  const postBody = req.body
  const usersDB = db.collection('users')
  const postDB = db.collection('posts')
  usersDB
    .findOne({ _id: new ObjectId(req.params.id) })
    .then(() => {
      postBody.userid = new ObjectId(req.params.id)
      postBody.timestamp = new Date()
      postDB.insertOne(postBody)
      res.status(200).json({ message: 'Post create Successfully' })
    })
    .catch(() => {
      res.status(404).json(err)
    })
})

//post update
app.post('/api/posts/:id/post/update', (req, res) => {
  let err = { error: 'Faild to update post' }
  const postID = req.params.id
  const updateBody = req.body
  const postDB = db.collection('posts')
  postDB
    .updateOne({ _id: new ObjectId(postID) }, { $set: updateBody })
    .then(() => {
      res.status(200).json({ message: 'Post updated Successfully' })
    })
    .catch(() => {
      res.status(404).json(err)
    })
})

//Delete post
app.delete('/api/posts/:id/post/delete', (req, res) => {
  let err = { error: 'Failed to delete post' }
  const postID = req.params.id
  const postDB = db.collection('posts')

  postDB
    .deleteOne({ _id: new ObjectId(postID) })
    .then(() => {
      res.status(200).json({ message: 'Post Removed Successfully' })
    })
    .catch(() => {
      res.status(404).json(err)
    })
})

//user get post list
app.get('/api/user/:id/posts', (req, res) => {
  const userId = req.params.id
  const postsDB = db.collection('posts')
  let postList = []
  postsDB
    .find({ userid: new ObjectId(userId) })
    .forEach((post) => {
      console.log(post)
      postList.push(post)
    })
    .then(() => {
      res.status(200).json(postList)
    })
    .catch(() => {
      res.status(404).json({ error: 'error' })
    })
})
//Get about page text
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

//  Original
// app.post('/api/user', (req, res) => {
//   let errorList = { errors: [] }
//   const reqUser = req.body
//   const nickname = reqUser.nickname
//   const email = reqUser.email
//   const usersDB = db.collection('users')

//   usersDB
//     .find()
//     .forEach((user) => {
//       console.log('User', user)
//       if (user.nickname === nickname) {
//         errorList.errors.push({ message: 'Nickname is taken', field: 'nickname' })
//       }
//       if (user.email === email) {
//         errorList.errors.push({ message: 'Email is taken', field: 'email' })
//       }
//     })
//     .then(() => {
//       if (errorList.errors.length > 0) {
//         res.status(404).json(errorList)
//       } else {
//         usersDB.insertOne(reqUser)
//         res.status(200).json(reqUser)
//       }
//     })
//     .catch(() => {
//       res.status(500).json({ error: "Couldn't connect to DB" })
//     })
// })
