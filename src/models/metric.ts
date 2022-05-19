import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface IMetric {
  name: string;
  value: number;
  timestamp: number;
  tags: {
    dataFeedId?: string;
    evmSignerAddress?: string;
  };
}

const MetricSchema = new Schema<IMetric>({
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
