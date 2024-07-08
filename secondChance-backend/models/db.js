// db.js
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

// MongoDB connection URL with authentication options
const {MONGO_URL: url, MONGO_DB: dbName} = process.env

let dbInstance = null;

async function connectToDatabase() {
    if (dbInstance){
        return dbInstance
    };       

    try {
        const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true}); 

        await client.connect()
        console.log('Connected to MongoDB dababase')

        dbInstance = client.db(dbName)
    } catch (error) {
        console.error(`Failed to connect to the databse: ${error}`)

        if (client) {
            await client.close()
        }
    } 
    
    return dbInstance
}

module.exports = connectToDatabase;
