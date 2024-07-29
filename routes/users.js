const express = require('express')
const { ObjectId } = require('mongodb')
const router = express.Router()

module.exports = (db) => {
  const usersDB = db.collection('users')

  //insert user
  router.post('/insert', (req, res) => {
    let err = { error: 'the value of the fields equal to 1 are taken', emailCheck: 0, nickCheck: 0 }
    const reqUser = req.body
    const nickname = reqUser.nickname
    const email = reqUser.email
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
  router.delete('/:userid/delete', (req, res) => {
    let err = { error: 'user does not exist' }
    const userID = req.params.userid
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
  router.post('/:userid/update', (req, res) => {
    const userID = req.params.userid
    usersDB
      .updateOne({ _id: new ObjectId(userID) }, { $set: req.body })
      .then(() => {
        res.status(200).json({ message: 'User Updated Successfully' })
      })
      .catch(() => {
        res.status(404).json({ error: 'Update Failed' })
      })
  })
  return router
}

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
