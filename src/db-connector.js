const mongoose = require("mongoose");
const mongodbInfo = require("../.secrets/mongodb.json");

const url = "mongodb+srv://" + mongodbInfo.login +
  ":" + mongodbInfo.password +
  "@" + mongodbInfo.host1 +
  "/" + mongodbInfo.defaultauthdb +
  "?" + mongodbInfo.options;

async function connectToRemoteMongo() {
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
  }).then("Connected to mongoDB");
}

module.exports = {
  connectToRemoteMongo,
};
