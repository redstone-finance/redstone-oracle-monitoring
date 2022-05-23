import { Metric } from "../models/metric";

export const aggregateMetricsQuery = (fromTimestamp: number) => {
  return Metric.aggregate([
    {
      $match: {
        timestamp: {
          $gte: fromTimestamp,
        },
      },
    },
    {
      $group: {
        _id: "$name",
        min: { $min: "$value" },
        max: { $max: "$value" },
        avg: { $avg: "$value" },
        numberOfSavedValues: { $sum: 1 },
      },
    },
    {
      $sort: { numberOfSavedValues: -1 },
    },
    {
      $project: {
        _id: 0,
        dataFeedId: "$_id",
        min: "$min",
        max: "$max",
        avg: "$avg",
        numberOfSavedValues: "$numberOfSavedValues",
      },
    },
  ]);
};
