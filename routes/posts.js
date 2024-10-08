const express = require('express')
const { ObjectId } = require('mongodb')
const general = require('../fixture/general_text')
const router = express.Router()
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

module.exports = (db) => {
  const postDB = db.collection('posts')
  const usersDB = db.collection('users')
  const templateJson = {
    tags: [],
    game: [],
    platform: [],
    text: '',
  }

  const sharedTemplate = {
    shared_post: {
      original_post: '',
      original_owner: '',
    },
  }
  //Insert post
  router.post('/:userid/post/insert', async (req, res) => {
    let err = { error: 'Faild to upload post' }
    const postBody = req.body
    const incorrectFields = general.keysMustInclude(templateJson, postBody)
    if (incorrectFields.incorrect_keys.length || Object.keys(incorrectFields.incorrect_value_type).length) {
      res.status(400).json({ error: 'Unmatched keys.', error_data: incorrectFields })
      return
    }
    usersDB
      .findOne({ _id: new ObjectId(req.params.userid) })
      .then(async (user) => {
        user.social.rank.exp += 2
        user.social.rank = general.checkRank(user.social.rank.exp)
        usersDB.updateOne({ _id: new ObjectId(req.params.userid) }, { $set: user })
        postBody.user_id = new ObjectId(req.params.userid)
        postBody.timestamp = new Date()
        postBody.likes = {
          count: 0,
          users: [],
        }
        postBody.saves = {
          count: 0,
          users: [],
        }
        postBody.shares = {
          count: 0,
          users: [],
        }
        postBody.shared_post = {
          original_post: '',
          original_owner: '',
        }
        postBody.shared = false
        const new_post = await postDB.insertOne(postBody)
        res.status(200).json({ message: 'Post create Successfully', post_id: new_post.insertedId })
      })
      .catch(() => {
        res.status(404).json(err)
      })
  })

  //update post
  router.post('/:postid/post/update', (req, res) => {
    //todo: change endpoint to this  /:postid/post/update that only owner can edit post

    let err = { error: 'Faild to update post' }
    const postID = req.params.postid
    const updateBody = req.body
    const postDB = db.collection('posts')
    const incorrectFields = general.areKeysIncluded(templateJson, updateBody)
    if (incorrectFields.inccorect_fields.length) {
      res.status(400).json({ error: 'Unmatched keys.', incorrect_missing_fields: incorrectFields })
      return
    }
    postDB
      .updateOne({ _id: new ObjectId(postID) }, { $set: updateBody })
      .then(() => {
        postDB.findOne({ _id: new ObjectId(postID) }).then((post) => {
          res.status(200).json({ message: 'Post updated Successfully', updated_post: post })
        })
      })
      .catch(() => {
        res.status(404).json(err)
      })
  })

  //insert file to post
  router.post('/:postid/files/upload', upload.array('image'), async (req, res) => {
    const postId = req.params.postid
    const files = req.files
    const uploadResults = []
    try {
      for (const file of files) {
        const result = await general.uploadFile(file)
        uploadResults.push(result)
      }
      const allSuccessful = uploadResults.every((result) => result.success)
      if (allSuccessful) {
        const fileUrls = uploadResults.map((result) => result.downloadURL)
        await postDB.updateOne({ _id: new ObjectId(postId) }, { $set: { media: fileUrls } })
        res.status(200).json({ message: 'Files uploaded successfully', files: uploadResults })
      } else {
        res.status(400).json({ error: 'Some files failed to upload', results: uploadResults })
      }
    } catch (error) {
      console.error('Error occurred during file upload:', error)
      res.status(500).json({ error: `Internal Server Error XD ${error}` })
    }
  })

  // remove files from post
  router.delete('/:postid/files/remove', (req, res) => {
    const postId = req.params.postid
    req.body.media_urls.forEach(async (url) => {
      const result = await general.removeFile(url)
      if (!result.success) {
        res.status(400).send(result.error)
        return
      }
    })
    postDB.updateOne({ _id: new ObjectId(postId) }, { $pullAll: { media: req.body.media_urls } })
    res.status(200).json({ message: 'removed file successfully' })
  })

  //Delete post
  router.delete('/:postid/post/delete', async (req, res) => {
    try {
      const postID = req.params.postid
      const post = await postDB.findOne({ _id: new ObjectId(postID) })
      if (!post) {
        return res.status(404).json({ error: 'Post not found' })
      }

      const user = await usersDB.findOne({ _id: post.user_id })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Delete the post
      if (typeof post.media !== 'undefined') {
        post.media.forEach(async (url) => {
          const result = await general.removeFile(url)
          if (!result.success) {
            res.status(400).send(result.error)
            return
          }
        })
      }
      await postDB.deleteOne({ _id: new ObjectId(postID) })

      user.social.rank.exp -= 2
      if (user.social.rank.exp < 0) {
        return res.status(400).json({ error: 'Exp cannot be lower than 0.' })
      }

      user.social.rank = general.checkRank(user.social.rank.exp)
      await usersDB.updateOne({ _id: user._id }, { $set: user })
      // Send success response
      res.status(200).json({ message: 'Post Removed Successfully' })
    } catch (error) {
      console.error('Error deleting post:', error)
      res.status(500).json({ error: 'Failed to delete post' })
    }
  })

  //get posts list by user_id
  router.get('/:userid/posts', (req, res) => {
    const userId = req.params.userid
    let postList = []

    postDB
      .find({ user_id: new ObjectId(userId) })
      .forEach((post) => {
        postList.push(post)
      })
      .then(() => {
        res.status(200).json({ posts_list: postList })
      })
      .catch(() => {
        res.status(404).json({ error: 'Failed to fetch posts' })
      })
  })
  //get all posts
  router.get('/allposts', (req, res) => {
    let postList = []
    postDB
      .find()
      .sort({ timestamp: -1 })
      .forEach((post) => {
        postList.push(post)
      })
      .then(() => {
        res.status(200).json({ posts_list: postList })
      })
      .catch(() => {
        res.status(404).json({ error: 'Failed to fetch posts' })
      })
  })

  //get posts of who a user is following
  router.get('/:userid/following/posts', (req, res) => {
    const userId = req.params.userid
    let postList = []
    usersDB
      .findOne({ _id: new ObjectId(userId) })
      .then((user) => {
        const postPromises = user.social.following.map((follower) => {
          return postDB.find({ user_id: new ObjectId(follower) }).toArray()
        })
        return Promise.all(postPromises)
      })
      .then((postsArrays) => {
        postList = postsArrays.flat()
        res.status(200).json({ posts_list: postList })
      })
      .catch((error) => {
        console.error('Error fetching posts:', error)
        res.status(404).json({ error: 'Failed to fetch posts' })
      })
  })

  // like post
  router.get('/:postid/:userid/like', (req, res) => {
    const userId = req.params.userid
    const postId = req.params.postid
    postDB.findOne({ _id: new ObjectId(postId) }).then((post) => {
      usersDB
        .findOne({ _id: post.user_id })
        .then((postCreator) => {
          post.likes.count += 1
          if (post.likes.users.includes(userId)) {
            res.status(400).json({ error: 'User already liked this post.' })
            return
          }
          post.likes.users.push(userId)
          postCreator.social.rank.exp += 1
          postCreator.social.total_likes += 1
          postCreator.social.rank = general.checkRank(postCreator.social.rank.exp)
          postDB.updateOne({ _id: new ObjectId(postId) }, { $set: post })
          usersDB.updateOne({ _id: new ObjectId(post.user_id) }, { $set: postCreator })
          usersDB.updateOne({ _id: new ObjectId(userId) }, { $push: { 'social.posts_liked': postId } })
          res.status(200).json({ message: 'post liked successfully' })
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
        .findOne({ _id: post.user_id })
        .then((postCreator) => {
          post.likes.count -= 1
          if (!post.likes.users.includes(userId)) {
            res.status(400).json({ error: 'User didnt liked this post.' })
            return
          }
          post.likes.users.pop(userId)
          postCreator.social.rank.exp -= 1
          //   if (user.social.rank.exp < 0) return { error: 'Exp cannot be lower than 0.' }
          if (postCreator.social.rank.exp < 0) {
            res.status(400).json({ error: 'Exp cannot be lower then 0.' })
            return
          }
          postCreator.social.rank = general.checkRank(postCreator.social.rank.exp)

          postDB.updateOne({ _id: new ObjectId(postId) }, { $set: post })
          usersDB.updateOne({ _id: new ObjectId(post.user_id) }, { $set: postCreator })
          usersDB.updateOne({ _id: new ObjectId(userId) }, { $pull: { 'social.posts_liked': postId } })

          res.status(200).json({ message: 'post unliked successfully' })
        })
        .catch(() => {
          res.status(400).json({ error: 'error' })
        })
    })
  })

  //get certain post
  router.get('/:postid/post', (req, res) => {
    const postID = req.params.postid
    postDB
      .findOne({ _id: new ObjectId(postID) })
      .then((post) => {
        res.status(200).json(post)
      })
      .catch(() => {
        res.status(400).json({ error: 'post doesnt exists' })
      })
  })

  // save post
  router.post('/:postid/:userid/save', (req, res) => {
    const userId = req.params.userid
    const postId = req.params.postid

    postDB.findOne({ _id: new ObjectId(postId) }).then((post) => {
      usersDB
        .findOne({ _id: post.user_id })
        .then((postCreator) => {
          post.saves.count += 1
          if (post.saves.users.includes(userId)) {
            res.status(400).json({ error: 'User already saved this post.' })
            return
          }
          post.saves.users.push(userId)
          postCreator.social.rank.exp += 3
          postCreator.social.total_saves += 1
          postCreator.social.rank = general.checkRank(postCreator.social.rank.exp)
          postDB.updateOne({ _id: new ObjectId(postId) }, { $set: post })
          usersDB.updateOne({ _id: new ObjectId(post.user_id) }, { $set: postCreator })
          usersDB.updateOne({ _id: new ObjectId(userId) }, { $push: { 'social.posts_saved': postId } })
          res.status(200).json({ message: 'post saved successfully' })
        })
        .catch(() => {
          res.status(400).json({ error: 'Failed to save post' })
        })
    })
  })

  // unsave post
  router.delete('/:postid/:userid/unsave', (req, res) => {
    const userId = req.params.userid
    const postId = req.params.postid

    postDB.findOne({ _id: new ObjectId(postId) }).then((post) => {
      usersDB
        .findOne({ _id: post.user_id })
        .then((postCreator) => {
          post.saves.count -= 1
          if (!post.saves.users.includes(userId)) {
            res.status(400).json({ error: 'User didnt saved this post.' })
            return
          }
          post.saves.users.pop(userId)
          postCreator.social.rank.exp -= 3
          if (postCreator.social.rank.exp < 0) {
            res.status(400).json({ error: 'Exp cannot be lower then 0.' })
            return
          }
          postCreator.social.rank = general.checkRank(postCreator.social.rank.exp)
          postDB.updateOne({ _id: new ObjectId(postId) }, { $set: post })
          usersDB.updateOne({ _id: new ObjectId(post.user_id) }, { $set: postCreator })
          usersDB.updateOne({ _id: new ObjectId(userId) }, { $pull: { 'social.posts_saved': postId } })
          res.status(200).json({ message: 'post unsaved successfully' })
        })
        .catch(() => {
          res.status(400).json({ error: 'Failed to unsave post' })
        })
    })
  })

  // get users saved posts
  router.get('/:userid/saved', async (req, res) => {
    const userId = req.params.userid

    try {
      const user = await usersDB.findOne({ _id: new ObjectId(userId) })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const postPromises = user.social.posts_saved.map((postid) =>
        postDB.findOne({ _id: new ObjectId(postid) })
      )

      const postList = await Promise.all(postPromises)

      res.status(200).json({ saved_post_list: postList })
    } catch (err) {
      console.error('Failed to fetch posts:', err)
      res.status(400).json({ error: 'Failed to fetch posts' })
    }
  })

  // get users liked posts
  router.get('/:userid/liked', async (req, res) => {
    const userId = req.params.userid

    try {
      const user = await usersDB.findOne({ _id: new ObjectId(userId) })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const postPromises = user.social.posts_liked.map((postid) =>
        postDB.findOne({ _id: new ObjectId(postid) })
      )

      const postList = await Promise.all(postPromises)

      res.status(200).json({ liked_post_list: postList })
    } catch (err) {
      console.error('Failed to fetch posts:', err)
      res.status(400).json({ error: 'Failed to fetch posts' })
    }
  })

  //share post
  router.post('/:userid/post/share', (req, res) => {
    let err = { error: 'Faild to share post' }
    const postBody = req.body
    const userID = req.params.userid

    const incorrectFields = general.keysMustInclude(sharedTemplate, postBody)
    if (incorrectFields.incorrect_keys.length || Object.keys(incorrectFields.incorrect_value_type).length) {
      res.status(400).json({ error: 'Unmatched keys.', error_data: incorrectFields })
      return
    }
    let filter = { _id: new ObjectId(postBody.shared_post.original_post) }
    let update = {
      $inc: { 'shares.count': 1 },
      $push: { 'shares.users': userID },
    }
    postDB.findOne(filter).then((post) => {
      if (post.shares.users.includes(userID)) {
        let update2 = {
          $inc: { 'shares.count': 1 },
        }
        postDB.updateOne(filter, update2)
      } else {
        postDB.updateOne(filter, update)
      }
    })
    let originalOwner = { _id: new ObjectId(postBody.shared_post.original_owner) }

    usersDB
      .findOne(originalOwner)
      .then((user) => {
        user.social.rank.exp += 4
        user.social.total_share += 1
        user.social.rank = general.checkRank(user.social.rank.exp)
        usersDB.updateOne(originalOwner, { $set: user })
        postBody.shared = true
        postBody.user_id = new ObjectId(userID)
        postBody.timestamp = new Date()
        postBody.likes = {
          count: 0,
          users: [],
        }
        postBody.saves = {
          count: 0,
          users: [],
        }
        postBody.shares = {
          count: 0,
          users: [],
        }
        postDB.insertOne(postBody)
        res.status(200).json({ message: 'Post Shared Successfully', post_owner_id: originalOwner._id })
      })
      .catch(() => {
        res.status(404).json(err)
      })
  })
  return router
}
