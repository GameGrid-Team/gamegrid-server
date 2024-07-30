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
        .then((user) => {
          post.likes.count += 1
          post.likes.users.push(userId)
          user.social.rank.exp += 3

          user.social = general.checkRank(user.social.rank.exp)

          postDB.updateOne({ _id: new ObjectId(postId) }, { $set: post })
          usersDB.updateOne({ _id: new ObjectId(post.userid) }, { $set: user })

          res.status(200).json(post)
        })
        .catch(() => {
          res.status(400).json({ error: 'error' })
        })
    })
  })

  // unlike post
  //   router.get('/:postid/:userid/unlike', (req, res) => {
  //     const userId = req.params.userid
  //     const postId = req.params.postid
  //     postDB.findOne({ _id: new ObjectId(postId) }).then((post) => {
  //       usersDB
  //         .findOne({ _id: post.userid })
  //         .then((user) => {
  //           post.likes.count -= 1
  //           post.likes.users.pop(userId)
  //           user.social.rank.exp -= 3
  //           //   if (user.social.rank.exp < 0) return { error: 'Exp cannot be lower than 0.' }

  //           user.social = general.checkRank(user.social.rank.exp)

  //           postDB.updateOne({ _id: new ObjectId(postId) }, { $set: post })
  //           usersDB.updateOne({ _id: new ObjectId(post.userid) }, { $set: user })

  //           res.status(200).json(post)
  //         })
  //         .catch(() => {
  //           res.status(400).json({ error: 'error' })
  //         })
  //     })
  //   })ך

  return router
}
