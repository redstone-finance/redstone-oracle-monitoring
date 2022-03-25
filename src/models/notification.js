const mongoose = require("mongoose");
const Types = require("../types");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  timestamp: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: Types.ExceptionType
  },
  level: {
    type: String,
    required: true,
    enum: Types.ExceptionLevel
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
