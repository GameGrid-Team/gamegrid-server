const Joi = require('joi')
const express = require('express')
const { connectToDb, getDb } = require('./db')
const app = express()
app.use(express.json())
// connectToDb((err) => {
//   if (!err) {
//     app.listen(3000, () => console.log("Listening on port 3000"));
//   }
// });

users = [
  {
    user_id: '1',
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
    user_id: '2',
    nickname: 'Tobi',
    fisrt_name: 'madara',
    last_name: 'uchiha',
    password: '11223344',
    gender: 'male',
    email: 'madara@gmail.com',
    birthday: 50,
    interest: ['tzkuyomi', 'king'],
  },
]

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))

app.get('/', (req, res) => {
  res.send('hello world')
})
app.get('/api/users', (req, res) => {
  res.send(users)
})
app.get('/api/users/:user_id', (req, res) => {
  const user = users.find((u) => u.user_id === req.params.user_id.toString())
  if (!user) res.status(404).send('User with given user_id was not found')
  res.send(user)
})

app.post('/api/users', (req, res) => {
  //   const schema = {
  //     name: Joi.string().min(3).required(),
  //   }
  //   const result = Joi.valid(req.body, schema)
  //   if (result.error) {
  //     res.status(400).send(result.error)
  //     return
  //   }

  if (!req.body.nickname || req.body.nickname.length < 3) {
    res.status(400).send('Name is required be min of 3 characters')
    return
  } // its only a testttttttt dont wory :)

  const user = {
    user_id: users.length + 1,
    nickname: req.body.nickname,
  }
  users.push(user)
  res.send(user)
})

// Template for users db
