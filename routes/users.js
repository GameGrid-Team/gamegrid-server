const express = require('express')
const { ObjectId } = require('mongodb')
const router = express.Router()
const general = require('../fixture/general_text')
const multer = require('multer')
const admin = require('firebase-admin')
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
})
const upload = multer({ storage: multer.memoryStorage() })

module.exports = (db) => {
  const defaultAvatar =
    'https://firebasestorage.googleapis.com/v0/b/gamegrid-f4689.appspot.com/o/files%2FHi6ytdtPudm74vacZe9mAi-1200-80-removebg-preview.png?alt=media&token=b701754a-d52c-4b60-bfd8-6a44a88f3bfd'
  const defaultRankPic =
    'https://firebasestorage.googleapis.com/v0/b/gamegrid-f4689.appspot.com/o/files%2FRookie.png?alt=media&token=033466a9-eb0c-4c91-bd24-e0c248769f42'
  const usersDB = db.collection('users')
  const templateJson = {
    nickname: '',
    first_name: '',
    last_name: '',
    password: '',
    gender: '',
    email: '',
    birth_date: '',
  }

  //insert user
  router.post('/insert', (req, res) => {
    let err = { error: 'The value of the fields equal to 1 are taken', emailCheck: 0, nickCheck: 0 }

    const userBody = req.body
    const incorrectFields = general.keysMustInclude(templateJson, userBody)
    if (incorrectFields.incorrect_keys.length || Object.keys(incorrectFields.incorrect_value_type).length) {
      res.status(400).json({ error: 'Unmatched keys.', error_data: incorrectFields })
      return
    }

    const nickname = userBody.nickname
    const email = userBody.email
    const social = {
      followers: [],
      following: [],
      posts_saved: [],
      posts_liked: [],
      total_likes: 0,
      total_share: 0,
      total_saves: 0,
      rank: { rank_name: 'Rookie', exp: 0, next_rank: 5, rank_image_url: defaultRankPic },
    }
    userBody.bio = 'Insert your bio'
    userBody.social = social
    userBody.avatar = defaultAvatar
    userBody.instagram = ''
    userBody.facebook = ''
    usersDB
      .find()
      .forEach((user) => {
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
          usersDB.insertOne(userBody)
          res.status(200).json(userBody)
        }
      })
      .catch(() => {
        res.status(500).json({ error: "Couldn't onnect to DB" })
      })
  })

  //insert user Avatar
  router.post('/:userid/avatar/upload', upload.single('image'), async (req, res) => {
    const userId = req.params.userid
    const result = await general.uploadFile(req.file)
    if (result.success) {
      usersDB.updateOne({ _id: new ObjectId(userId) }, { $set: { avatar: result.downloadURL } })
      res.status(200).json({ message: 'Avatar set successfully', file: result })
    } else {
      res.status(400).json({ error: 'Avatar failed to upload' })
    }
  })

  // remove avatar file
  router.delete('/:userid/avatar/remove', async (req, res) => {
    const userId = req.params.userid
    if (req.body.avatar_url === defaultAvatar) {
      res.status(200).json({ message: 'removed file successfully' })
      return
    } else {
      const result = await general.removeFile(req.body.avatar_url)
      if (result.success) {
        usersDB.updateOne({ _id: new ObjectId(userId) }, { $set: { avatar: defaultAvatar } })
        res.status(200).json({ message: 'removed file successfully' })
      } else {
        res.status(400).send(result.error)
      }
    }
  })

  //follow user
  router.post('/:userid/:followid/follow', (req, res) => {
    let err = { error: 'error following user' }
    const followId = req.params.followid
    const userId = req.params.userid
    usersDB.findOne({ _id: new ObjectId(followId) }).then((follow) => {
      if (follow.social.followers.includes(userId)) {
        res.status(400).json({ error: 'You already followed this user.' })
        return
      }
      usersDB.findOne({ _id: new ObjectId(userId) }).then((user) => {
        if (user.social.following.includes(followId)) {
          res.status(400).json({ error: 'User already in your following list.' })
          return
        }
        usersDB
          .updateOne({ _id: new ObjectId(followId) }, { $push: { 'social.followers': userId } })
          .then(() => {
            usersDB.updateOne({ _id: new ObjectId(userId) }, { $push: { 'social.following': followId } })
            res.status(200).json({ message: 'User Followed Successfully' })
          })
          .catch(() => {
            res.status(404).json(err)
          })
      })
    })
  })

  //leadboard
  router.get('/leaderboard', async (req, res) => {
    try {
      const users = await usersDB.find().sort({ 'social.rank.exp': -1 }).toArray()
      res.status(200).json({ users: users })
    } catch {
      res.status(500).json({ error: 'Failed to retrieve leaderboard' })
    }
  })

  //unfollow user
  router.post('/:userid/:unfollowid/unfollow', (req, res) => {
    let err = { error: 'error unfollowing user' }
    const unfollowId = req.params.unfollowid
    const userId = req.params.userid
    usersDB.findOne({ _id: new ObjectId(unfollowId) }).then((unfollow) => {
      if (!unfollow.social.followers.includes(userId)) {
        res.status(400).json({ error: 'You already unfollowed this user.' })
        return
      }
      usersDB.findOne({ _id: new ObjectId(userId) }).then((user) => {
        if (!user.social.following.includes(unfollowId)) {
          res.status(400).json({ error: 'User is not in your following list.' })
          return
        }
        usersDB
          .updateOne({ _id: new ObjectId(unfollowId) }, { $pull: { 'social.followers': userId } })
          .then(() => {
            usersDB.updateOne({ _id: new ObjectId(userId) }, { $pull: { 'social.following': unfollowId } })
            res.status(200).json({ message: 'User unFollowed Successfully' })
          })
          .catch(() => {
            res.status(404).json(err)
          })
      })
    })
  })

  //user deletion
  router.delete('/:userid/delete', async (req, res) => {
    let errUser = { error: 'User does not exist', type: 'user' }
    let errAvatar = { error: 'failed to delete avatar', type: 'avatar' }
    const userID = req.params.userid

    await usersDB
      .findOneAndDelete({ _id: new ObjectId(userID) })
      .then(async (user) => {
        if (user === null) {
          throw errUser
        } else {
          if (user.avatar !== defaultAvatar) {
            const result = await general.removeFile('sacas')
            if (result.success) {
              res.status(200).json({ message: 'User Removed Successfully' })
            } else {
              throw errAvatar
            }
          } else {
            res.status(200).json({ message: 'User Removed Successfully' })
          }
        }
      })
      .catch((error) => {
        res.status(404).json(error)
      })
  })

  //update user
  router.post('/:userid/update', async (req, res) => {
    const userID = req.params.userid
    let newTemplate = templateJson
    newTemplate.bio = ''
    newTemplate.instagram = ''
    newTemplate.facebook = ''
    const incorrectFields = general.areKeysIncluded(newTemplate, req.body)
    if (Object.keys(incorrectFields.inccorect_fields).length) {
      res.status(400).json({ error: 'Unmatched keys.', error_data: incorrectFields })
      return
    }

    //refactor for flags
    if (req.body.email) {
      const existingUser = await usersDB.findOne({ email: req.body.email })
      if (existingUser !== null) {
        res.status(400).json({ message: 'Email is taken' })
        return
      }
    }
    if (req.body.nickname) {
      const existingUser = await usersDB.findOne({ nickname: req.body.nickname })
      if (existingUser !== null) {
        res.status(400).json({ message: 'Nickname is taken' })
        return
      }
    }
    usersDB
      .updateOne({ _id: new ObjectId(userID) }, { $set: req.body })
      .then(() => {
        res.status(200).json({ message: 'User Updated Successfully' })
      })
      .catch(() => {
        res.status(404).json({ error: 'Update Failed' })
      })
  })

  // get user by id
  router.get('/:userid/data', (req, res) => {
    let err = { error: 'User does not exist' }
    const userID = req.params.userid
    usersDB
      .findOne({ _id: new ObjectId(userID) })
      .then((user) => {
        res.status(200).json(user)
      })
      .catch(() => {
        res.status(404).json(err)
      })
  })

  //all users data
  router.get('/all', (res) => {
    let err = { error: 'Failed to fetch users' }
    let usersList = []
    usersDB
      .find()
      .forEach((user) => {
        usersList.push(user)
      })
      .then(() => {
        res.status(200).json({ users: usersList })
      })
      .catch(() => {
        res.status(404).json(err)
      })
  })

  //get user following list
  router.get('/:userid/list/following', async (req, res) => {
    const userId = req.params.userid
    try {
      const user = await usersDB.findOne({ _id: new ObjectId(userId) })
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      const followingPromises = user.social.following.map((followingU) =>
        usersDB.findOne({ _id: new ObjectId(followingU) })
      )
      const followingList = await Promise.all(followingPromises)
      res.status(200).json({ following_list: followingList })
    } catch (error) {
      res.status(404).json({ error: `${('Error fetching following list:', error)}` })
    }
  })

  // Search users by text
  router.get('/search', async (req, res) => {
    const searchText = req.query.text
    if (!searchText) {
      return res.status(400).json({ message: 'Search query is required' })
    }

    try {
      const searchWords = searchText.split(' ').map((word) => new RegExp(word, 'i'))
      const users = await usersDB
        .find({
          $or: [
            { nickname: { $in: searchWords } },
            { first_name: { $in: searchWords } },
            { last_name: { $in: searchWords } },
          ],
        })
        .project({
          nickname: 1,
          first_name: 1,
          last_name: 1,
          avatar: 1,
        })
        .toArray()
      res.status(200).json({ users: users })
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error })
    }
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
