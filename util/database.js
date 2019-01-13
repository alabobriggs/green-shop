const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient


 // the underscore signifize it will only be used in this file
let _db;

const mongoConnect = (callback) => {
    MongoClient.connect("mongodb://localhost:27017/nodecomplete", {
        useNewUrlParser: true
    })
        .then(client => {
            console.log('connected')
            _db = client.db()
            callback()
        })
        .catch(err => {
            console.log(err)
            throw err
        })
}

const getDb = () => {
    if(_db) {
        return _db
    }
    throw 'no database found'
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb