const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MetricSchema = new Schema({
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

module.exports = mongoose.model("Metric", MetricSchema);
