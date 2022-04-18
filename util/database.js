/**
 * Set up DMongoDB Database with application
 */

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const url = 'mongodb://127.0.0.1:27017/'

const mongoConnect = callback => {
    MongoClient.connect(url).then(client=>{
        console.log('Connected');
        _db = client.db('node-complete');
        callback()
    }).catch(err=>{
        console.log(err);
        throw err;
    });
};

const getDb = ()=> {
    if(_db) {
        return _db
    }

    throw 'No Database Found'
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

