const { MongoClient } = require('mongodb')
let dbConnection
const uri = 'mongodb+srv://lioren:WkmPa3gtx4GU5KL3@cluster0.zcwf0na.mongodb.net/'

// Firebase importation
const { initializeApp, getApp, getApps } = require('firebase/app')
const { getAnalytics } = require('firebase/analytics')
const { getAuth } = require('firebase/auth')

const firebaseConfig = {
  apiKey: 'AIzaSyAyzPfwLGS6fLohdlAxuTlcvvbjduKq14E',
  authDomain: 'gamegrid-f4689.firebaseapp.com',
  projectId: 'gamegrid-f4689',
  storageBucket: 'gamegrid-f4689.appspot.com',
  messagingSenderId: '1024355095270',
  appId: '1:1024355095270:web:c512b97d13fd92910e2127',
  measurementId: 'G-XBH6KV2NHT',
}
// Initialize Firebase
const fbapp = initializeApp(firebaseConfig)
const auth = getAuth(fbapp)
// const analytics = getAnalytics(fbapp)

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(uri)
      .then((client) => {
        dbConnection = client.db('Gamegrid')
        return cb()
      })
      .catch((err) => {
        console.error(err)
        return cb(err)
      })
  },
  getDb: () => dbConnection,
  fbapp: () => fbapp,
  auth: () => auth,
}
