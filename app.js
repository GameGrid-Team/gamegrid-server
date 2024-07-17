const express = require('express')
const Joi = require('joi')
const { connectToDb, getDb } = require('./db')
const { ObjectId } = require('mongodb')
const app = express()
app.use(express.json())
import {aboutTxt} from `/fixture/general_text`
let db



const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))


app.get('/about',(req,res)=>{
  res.send(aboutTxt)
})

