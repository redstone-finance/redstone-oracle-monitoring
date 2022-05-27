import { connectToRemoteMongo } from "../helpers/db-connector";
import { Metric } from "../models/metric";

export const fetchMetricsByFromDate = async (fromTimestamp: number) => {
  const fromTimestampCondition = {
    timestamp: {
      $gte: fromTimestamp,
    },
  };

  await connectToRemoteMongo();
  const metrics = await Metric.find(fromTimestampCondition);
  return metrics;
};
