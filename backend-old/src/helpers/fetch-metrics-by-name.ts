import { Metric } from "../models/metric";

export const fetchMetricsByName = async (
  fromTimestamp: number,
  name: string
) => {
  const condition = {
    timestamp: {
      $gte: fromTimestamp,
    },
    name: {
      $eq: name,
    },
  };

  return await Metric.find(condition);
};
