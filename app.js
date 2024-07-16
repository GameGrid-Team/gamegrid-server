const express = require('express')
const { connectToDb, getDb } = require('./db')
const app = express()

// connectToDb((err) => {
//   if (!err) {
//     app.listen(3000, () => console.log("Listening on port 3000"));
//   }
// });

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))

app.get('/', (req, res) => {
  res.send('hello world')
})
app.get('/api/users', (req, res) => {
  res.send([1, 2, 3])
})
app.get('/api/users/:id', (req, res) => {
  res.send(req.params.id)
})
app.get('/api/posts/:year/:month', (req, res) => {
  res.send(req.query)
})

// Template for users db

users = [
  {
    user_id: '123',
    nickname: 'naruto',
    fisrt_name: 'naruto',
    last_name: 'uzumaki',
    password: '11223344',
    gender: 'male',
    email: 'naruto@gmail.com',
    age: 12,
    interest: ['hokage', 'shipuden'],
  },
  {
    user_id: '456',
    nickname: 'Tobi',
    fisrt_name: 'madara',
    last_name: 'uchiha',
    password: '11223344',
    gender: 'male',
    email: 'madara@gmail.com',
    birthday: 5,
    interest: ['tzkuyomi', 'king'],
  },
  {
    user_id: '789',
    nickname: 'usless',
    fisrt_name: 'sakura',
    last_name: 'Haruno',
    password: '11223344',
    gender: 'female',
    email: 'sakura@gmail.com',
    birthday: 5,
    interest: ['nothing', 'boring'],
  },
]
