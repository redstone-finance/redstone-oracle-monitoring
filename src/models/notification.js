const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  timestamp: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["timestamp-diff", "invalid-signature", "fetching-failed"]
  },
  level: {
    type: String,
    required: true,
    enum: ["ERROR", "WARNING"]
  },
  url: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: false,
  },
  timestampDiffMilliseconds: {
    type: Number,
    required: false,
  },
});

module.exports = mongoose.model("Notification", NotificationSchema);
