const { MongoClient } = require("mongodb");

let _db;

const mongoConnect = async (callback) => {
  try {
    const user = process.env.DB_USER || "lancekian";
    const password = process.env.DB_PASSWORD;
    const host = process.env.DB_HOST || "nodejs-course.0ggknfc.mongodb.net";
    const dbName = process.env.DB_NAME || "myDatabase";

    if (!password) {
      throw new Error("Missing DB_PASSWORD in .env");
    }

    const encodedPassword = encodeURIComponent(password);

    const uri =
      process.env.MONGODB_URI ||
      `mongodb+srv://${user}:${encodedPassword}@${host}/${dbName}?retryWrites=true&w=majority`;

    const client = await MongoClient.connect(uri);

    console.log("Connected to MongoDB!");

    _db = client.db(dbName);

    callback(client);
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw new Error("No database found! Did you connect first?");
};

module.exports = {
  mongoConnect,
  getDb,
};
// const Sequelize = require('sequelize')
// require('dotenv').config()
// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {dialect: 'mysql', host: process.env.DB_HOST})

// module.exports = sequelize
