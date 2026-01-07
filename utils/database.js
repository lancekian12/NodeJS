const { MongoClient } = require('mongodb');

const mongoConnect = async (callback) => {
  try {
    const user = process.env.DB_USER || 'lancekian';
    const password = process.env.DB_PASSWORD;
    const host = process.env.DB_HOST || 'nodejs-course.0ggknfc.mongodb.net';
    const dbName = process.env.DB_NAME || 'myDatabase';

    if (!password) {
      throw new Error('Missing DB_PASSWORD in .env');
    }

    // If your password contains characters that need encoding, encode it:
    const encodedPassword = encodeURIComponent(password);

    const uri = process.env.MONGODB_URI || 
      `mongodb+srv://${user}:${encodedPassword}@${host}/${dbName}?retryWrites=true&w=majority`;

    const client = await MongoClient.connect(uri);
    console.log('Connected to MongoDB!');
    callback(client);
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    throw err;
  }
};

module.exports = mongoConnect;

// const Sequelize = require('sequelize')
// require('dotenv').config()
// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {dialect: 'mysql', host: process.env.DB_HOST})

// module.exports = sequelize
