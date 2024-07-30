const express = require('express');
const Joi = require('joi');
const cors = require('cors');
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const app = express();
app.use(express.json());
app.use(cors());

let db;
let gfs;

// Connect to DB
connectToDb((err) => {
  if (!err) {
    const port = process.env.PORT || 3001;
    app.listen(port, () => console.log(`Listening on port ${port}`));
    db = getDb();
    gfs = Grid(db, db.mongo);
    gfs.collection('uploads');
  }
});

// Multer GridFS storage configuration
const storage = new GridFsStorage({
  url: 'mongodb+srv://lioren:WkmPa3gtx4GU5KL3@cluster0.zcwf0na.mongodb.net/', // Replace with your MongoDB URL
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return {
      bucketName: 'uploads', // Collection name in MongoDB
      filename: file.originalname,
    };
  },
});

const upload = multer({ storage });

// Route to upload files
app.post('/api/upload', upload.single('file'), (req, res) => {
  res.status(201).json({ file: req.file });
});

// Route to get files by filename
app.get('/api/file/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    // File exists, stream it to the client
    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  });
});

// Route to delete files
app.delete('/api/file/:filename', (req, res) => {
  gfs.remove({ filename: req.params.filename, root: 'uploads' }, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete file' });
    res.status(200).json({ message: 'File deleted successfully' });
  });
});

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
// 6697d55e5bc67c001a0c738c
app.delete('/api/user/:id/delete', (req, res) => {
  let err = { error: 'user does not exist' }
  const userID = req.params.id
  const usersDB = db.collection('users')

  usersDB.deleteOne({ _id: new ObjectId(userID)})
    .then(()=>{
      res.status(200).json({message:'User Removed Successfully'})
    })
    .catch(() => {
      res.status(404).json(err)
    })
})


//update user
app.post('/api/user/:id/update', (req, res) => {  
  const userID = req.params.id
  const usersDB = db.collection('users')

  usersDB.updateOne(
    {_id:new ObjectId(userID)},
    {$set:req.body}
  )
  .then(()=>{
    res.status(200).json({message:'User Updated Successfully'})
  })
  .catch(() => {
    res.status(404).json({ error: "Update Failed" })
  })
})

//user login
app.get('/api/login', (req, res) => {
  //{email: #####,pass:#######}/{nickname: #####,pass:#######}
  const {email,nickname,password}=req.query
  let filter = { password };
    if (email) filter.email = email;
    if (nickname) filter.nickname = nickname;
  const usersDB = db.collection('users')

  usersDB.findOne(filter)
  .then((user)=>{
    res.status(200).json({userid:user._id.toString(),message:"login successful"})
  })
  .catch(() => {
    res.status(404).json({ error: "Login Failed" })

  })
})






app.get('/api/about', (req, res) => {
  res.json({ aboutText: generalTexts.aboutTxt })
})
app.get('/api/ping', (req, res) => {
  res.json(['pong I LOVE U 3'])
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

