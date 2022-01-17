const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MailSchema = new Schema({
  timestamp: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Mail", MailSchema);
