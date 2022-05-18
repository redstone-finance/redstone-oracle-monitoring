import {
  connectToRemoteMongo,
  disconnectFromRemoteMongo,
} from "../helpers/db-connector";
import { Metric } from "../models/metric";

export const fetchMetricsByFromDate = async (fromTimestamp: number) => {
  const oldTimestampCondition = {
    created_at: {
      $lte: fromTimestamp,
    },
  };

  await connectToRemoteMongo();
  const metrics = await Metric.find(oldTimestampCondition);
  await disconnectFromRemoteMongo();
  return metrics;
};
