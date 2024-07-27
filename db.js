const { MongoClient } = require('mongodb')

let dbConnection
const uri = 'mongodb+srv://lioren:WkmPa3gtx4GU5KL3@cluster0.zcwf0na.mongodb.net/'

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
}
