const express = require('express')
const { ObjectId } = require('mongodb')
const router = express.Router()

module.exports = (db) => {
  const usersDB = db.collection('users')

  //user login
  router.get('/', (req, res) => {
    // quesry = /api/login?nickname=naruto&password=11223344
    //{email: #####,pass:#######}/{nickname: #####,pass:#######}
    const { email, nickname, password } = req.query
    let filter = { password }
    if (email) filter.email = email
    if (nickname) filter.nickname = nickname
    console.log(filter)
    usersDB
      .findOne(filter)
      .then((user) => {
        res.status(200).json({ userid: user._id.toString(), message: 'login successful' })
      })
      .catch(() => {
        res.status(404).json({ error: 'Login Failed' })
      })
  })

  return router
}
