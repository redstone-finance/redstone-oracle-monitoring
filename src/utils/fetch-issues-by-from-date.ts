import {
  connectToRemoteMongo,
  disconnectFromRemoteMongo,
} from "../helpers/db-connector";
import { Issue } from "../models/issue";

export const fetchIssuesByFromDate = async (fromTimestamp: number) => {
  const fromTimestampCondition = {
    timestamp: {
      $gte: fromTimestamp,
    },
  };

  await connectToRemoteMongo();
  const issues = await Issue.find(fromTimestampCondition);
  await disconnectFromRemoteMongo();
  return issues;
};
