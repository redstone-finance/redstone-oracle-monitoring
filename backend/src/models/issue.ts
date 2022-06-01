import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface Issue {
  timestamp: number;
  type: string;
  symbol?: string;
  level: string;
  dataFeedId: string;
  evmSignerAddress?: string;
  url?: string;
  comment?: string;
  timestampDiffMilliseconds?: number;
}

const IssueSchema = new Schema<Issue>({
  timestamp: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "timestamp-diff",
      "invalid-signature",
      "one-source-failed",
      "data-feed-failed",
    ],
  },
  symbol: {
    type: String,
    required: false,
  },
  level: {
    type: String,
    required: true,
    enum: ["ERROR", "WARNING"],
  },
  dataFeedId: {
    type: String,
    required: true,
  },
  evmSignerAddress: {
    type: String,
    required: false,
  },
  url: {
    type: String,
    required: false,
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

export const Issue = mongoose.model("Issue", IssueSchema);
