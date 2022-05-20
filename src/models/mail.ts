import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MailSchema = new Schema({
  timestamp: {
    type: Number,
    required: true,
  },
});

export const Mail = mongoose.model("Mail", MailSchema);
