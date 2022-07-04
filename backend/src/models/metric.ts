import mongoose from "mongoose";
import { Metric as MetricType } from "../../../shared/types";
const Schema = mongoose.Schema;

const MetricSchema = new Schema<MetricType>({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Number,
    required: true,
  },

  tags: {
    dataFeedId: {
      type: String,
      required: false,
    },
    evmSignerAddress: {
      type: String,
      required: false,
    },
  },
});

export const Metric = mongoose.model("Metric", MetricSchema);
