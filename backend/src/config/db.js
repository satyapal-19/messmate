const mongoose = require("mongoose");

async function connectDb(uri) {
  if (!uri) throw new Error("MONGO_URI is required");
  await mongoose.connect(uri);
}

module.exports = { connectDb };
