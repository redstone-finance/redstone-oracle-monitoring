import { Issue } from "../models/issue";

export const aggregateIssuesByAttribute = (
  fromTimestamp: number,
  attributeName: keyof Issue
) => {
  return Issue.aggregate([
    {
      $match: {
        timestamp: {
          $gte: fromTimestamp,
        },
      },
    },
    {
      $group: {
        _id: `$${attributeName}`,
        errors: {
          $sum: { $cond: [{ $eq: ["$level", "ERROR"] }, 1, 0] },
        },
        warnings: {
          $sum: { $cond: [{ $eq: ["$level", "WARNING"] }, 1, 0] },
        },
        "data-feed-failed": {
          $sum: { $cond: [{ $eq: ["$type", "data-feed-failed"] }, 1, 0] },
        },
        "one-source-failed": {
          $sum: { $cond: [{ $eq: ["$type", "one-source-failed"] }, 1, 0] },
        },
        "timestamp-diff": {
          $sum: { $cond: [{ $eq: ["$type", "timestamp-diff"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        url: "$_id",
        errors: "$errors",
        warnings: "$warnings",
        groupedByType: {
          "data-feed-failed": "$data-feed-failed",
          "one-source-failed": "$one-source-failed",
          "timestamp-diff": "$timestamp-diff",
        },
      },
    },
  ]);
};
