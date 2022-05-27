import { Model } from "mongoose";

export const fetchByFromDate = async <T>(
  model: Model<T>,
  fromTimestamp: number
) => {
  const fromTimestampCondition = {
    timestamp: {
      $gte: fromTimestamp,
    },
  };

  const issues = await model.find(fromTimestampCondition);
  return issues;
};
