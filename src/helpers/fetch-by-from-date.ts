import { Model } from "mongoose";
import { connectToRemoteMongo } from "../helpers/db-connector";

export const fetchByFromDate = async <T>(
  model: Model<T>,
  fromTimestamp: number
) => {
  const fromTimestampCondition = {
    timestamp: {
      $gte: fromTimestamp,
    },
  };

  await connectToRemoteMongo();
  const issues = await model.find(fromTimestampCondition);
  return issues;
};
