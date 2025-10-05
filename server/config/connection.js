require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "copy_nexus_dev";

mongoose.connect(MONGO_URL, {
  dbName: DB_NAME,
  serverSelectionTimeoutMS: 5000,
});

module.exports = mongoose.connection;
