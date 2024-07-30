const express = require('express')
const { string } = require('joi')
const { ObjectId } = require('mongodb')
const general = require('../fixture/general_text')
const router = express.Router()

module.exports = (db) => {
  const postDB = db.collection('posts')
  const usersDB = db.collection('users')

  //Insert post+
  router.post('/:userid/post/insert', (req, res) => {
    let err = { error: 'Faild to upload post' }
    const postBody = req.body
    usersDB
      .findOne({ _id: new ObjectId(req.params.userid) })
      .then(() => {
        postBody.userid = new ObjectId(req.params.userid)
        postBody.timestamp = new Date()
        postDB.insertOne(postBody)
        res.status(200).json({ message: 'Post create Successfully' })
      })
      .catch(() => {
        res.status(404).json(err)
      })
  })

  //post data update likes, saves, all
  router.post('/:postid/post/update', (req, res) => {
    let err = { error: 'Faild to update post' }
    const postID = req.params.postid
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
  router.delete('/:postid/post/delete', (req, res) => {
    let err = { error: 'Failed to delete post' }
    const postID = req.params.postid

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
  router.get('/:userid/posts', (req, res) => {
    const userId = req.params.userid
    let postList = []
    postsDB
      .find({ userid: new ObjectId(userId) })
      .forEach((post) => {
        console.log(post)
        postList.push(post)
      })
      .then(() => {
        res.status(200).json({ posts_list: postList })
      })
      .catch(() => {
        res.status(404).json({ error: 'Failed to fetch posts' })
      })
  })

  // like post
  router.get('/:postid/:userid/like', (req, res) => {
    const userId = req.params.userid
    const postId = req.params.postid
    postDB.findOne({ _id: new ObjectId(postId) }).then((post) => {
      usersDB
        .findOne({ _id: post.userid })
<<<<<<< HEAD
        .then((user) => {
          console.log(1)

          post.likes.count += 1
          console.log(2)

          post.likes.users.push(userId)
          console.log(3)
          console.log(user)

          user.social.rank.exp += 3
          console.log(4)
=======
        .then((postCreator) => {
          post.likes.count += 1
          if (post.likes.users.includes(userId)) {
            res.status(400).json({ error: 'User already liked this post.' })
            return
          }
          post.likes.users.push(userId)
>>>>>>> 23567eea7b2a6d147ed5cfb269f87a45c8ff2000

          postCreator.social.rank.exp += 3

          postCreator.social.rank = general.checkRank(postCreator.social.rank.exp)

          postDB.updateOne({ _id: new ObjectId(postId) }, { $set: post })
          usersDB.updateOne({ _id: new ObjectId(post.userid) }, { $set: postCreator })

          res.status(200).json(post)
        })
        .catch(() => {
          res.status(400).json({ error: 'error' })
        })
    })
  })

  // unlike post
  router.get('/:postid/:userid/unlike', (req, res) => {
    const userId = req.params.userid
    const postId = req.params.postid
    postDB.findOne({ _id: new ObjectId(postId) }).then((post) => {
      usersDB
        .findOne({ _id: post.userid })
<<<<<<< HEAD
        .then((user) => {
          console.log(111111111)
          post.likes.count -= 1
          console.log(222222222)
          post.likes.users.pop(userId)
          console.log(333333333)
          // add check for negative exp  { error: 'Exp cannot be lower than 0.' }
          user.social.rank.exp -= 3
          console.log(444444444)
          user.social = general.checkRank(user.social.rank.exp)

          postDB.updateOne({ _id: new ObjectId(postId) }, { $set: post })
          usersDB.updateOne({ _id: new ObjectId(post.userid) }, { $set: user })
=======
        .then((postCreator) => {
          post.likes.count -= 1
          console.log('hey')
          if (!post.likes.users.includes(userId)) {
            res.status(400).json({ error: 'User didnt liked this post.' })
            return
          }
          post.likes.users.pop(userId)
          console.log('hey2')
          postCreator.social.rank.exp -= 3
          //   if (user.social.rank.exp < 0) return { error: 'Exp cannot be lower than 0.' }
          if (postCreator.social.rank.exp < 0) {
            res.status(400).json({ error: 'Exp cannot be lower then 0.' })
            return
          }
          console.log('hey3')
          postCreator.social.rank = general.checkRank(postCreator.social.rank.exp)

          postDB.updateOne({ _id: new ObjectId(postId) }, { $set: post })
          usersDB.updateOne({ _id: new ObjectId(post.userid) }, { $set: postCreator })
>>>>>>> 23567eea7b2a6d147ed5cfb269f87a45c8ff2000

          res.status(200).json(post)
        })
        .catch(() => {
          res.status(400).json({ error: 'error' })
        })
    })
  })

  return router
}
