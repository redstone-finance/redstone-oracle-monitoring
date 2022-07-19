import { Injectable } from "@nestjs/common";
import { parseArrayToObject } from "../../shared/parse-array-to-object";
import { Issue } from "./issues.model";

@Injectable()
export class IssuesService {
  getIssuesByTimeframe(timeframe: number) {
    const toTimestamp = Date.now();
    const fromTimestamp = toTimestamp - timeframe;
    return this.generateIssuesAnalysis(fromTimestamp, toTimestamp);
  }

  generateIssuesAnalysis = async (
    fromTimestamp: number,
    toTimestamp: number
  ) => {
    const groupedByDataFeed = await this.aggregateIssuesByAttribute(
      fromTimestamp,
      "dataFeedId"
    );
    const groupedByUrls = await this.aggregateIssuesByAttribute(
      fromTimestamp,
      "url"
    );

    const parsedGroupedByDataFeed = parseArrayToObject(groupedByDataFeed);
    const parsedGroupedByUrls = parseArrayToObject(groupedByUrls);

    return {
      fromTimestamp: `${fromTimestamp} ${new Date(fromTimestamp)}`,
      toTimestamp: `${toTimestamp} ${new Date(toTimestamp)}`,
      groupedByDataFeed: parsedGroupedByDataFeed,
      groupedByUrls: parsedGroupedByUrls,
    };
  };

  aggregateIssuesByAttribute = (
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
}
