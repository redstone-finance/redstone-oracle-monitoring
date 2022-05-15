const mongoose = require("mongoose");
const config = require("../config");

async function connectToRemoteMongo() {
  await mongoose
    .connect(config.mongoDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then("Connected to mongoDB");
}

module.exports = {
  connectToRemoteMongo,
};
