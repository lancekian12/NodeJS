const mongoose = require("mongoose");

const mongoConnect = async () => {
  try {
    const user = process.env.DB_USER
    const password = process.env.DB_PASSWORD;
    const host =
      process.env.DB_HOST 
    const dbName = process.env.DB_NAME

    if (!password) {
      throw new Error("Missing DB_PASSWORD in .env");
    }

    const encodedPassword = encodeURIComponent(password);

    const uri =
      process.env.MONGODB_URI ||
      `mongodb+srv://${user}:${encodedPassword}@${host}/${dbName}?retryWrites=true&w=majority`;

    await mongoose.connect(uri);


    console.log("✅ Connected to MongoDB via Mongoose");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
};

module.exports = mongoConnect;

// const Sequelize = require('sequelize')
// require('dotenv').config()
// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {dialect: 'mysql', host: process.env.DB_HOST})

// module.exports = sequelize
