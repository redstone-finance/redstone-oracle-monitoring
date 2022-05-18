import {
  connectToRemoteMongo,
  disconnectFromRemoteMongo,
} from "../helpers/db-connector";
import { Issue } from "../models/issue";

export const fetchIssuesByFromDate = async (fromTimestamp: number) => {
  const oldTimestampCondition = {
    timestamp: {
      $lte: fromTimestamp,
    },
  };

  await connectToRemoteMongo();
  const issues = await Issue.find(oldTimestampCondition);
  await disconnectFromRemoteMongo();
  return issues;
};
