const mongoose = require("mongoose");
const mongodbInfo = require("../.secrets/local_mongodb.json");

const url = mongodbInfo.connectionString;

async function connectToRemoteMongo() {
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then("Connected to mongoDB");
}

module.exports = {
  connectToRemoteMongo,
};
