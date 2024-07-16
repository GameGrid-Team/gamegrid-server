const { MongoClient } = require('mongodb')

let dbConnection

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect('mmongodb://localhost:27017/gamegrid')
      .then((client) => {
        dbConnection = client.db()
        return cb()
      })
      .catch((err) => {
        console.error(err)
        return cb(err)
      })
  },
  getDb: () => dbConnection,
}
