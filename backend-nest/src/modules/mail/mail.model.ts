import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface Mail {
  timestamp: number;
}

const MailSchema = new Schema({
  timestamp: {
    type: Number,
    required: true,
  },
});

export const Mail = mongoose.model("Mail", MailSchema);
