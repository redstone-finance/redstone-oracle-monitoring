import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { parseArrayToObject } from "../../shared/parse-array-to-object";
import { Issue, IssueDocument } from "./issues.schema";

@Injectable()
export class IssuesService {
  constructor(
    @InjectModel(Issue.name) private issueModel: Model<IssueDocument>
  ) {}

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
      "dataServiceId"
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
    attributeName: keyof IssueDocument
  ) => {
    return this.issueModel.aggregate([
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
          "data-service-failed": {
            $sum: { $cond: [{ $eq: ["$type", "data-service-failed"] }, 1, 0] },
          },
          "no-data-package": {
            $sum: { $cond: [{ $eq: ["$type", "no-data-package"] }, 1, 0] },
          },
          "one-url-failed": {
            $sum: { $cond: [{ $eq: ["$type", "one-url-failed"] }, 1, 0] },
          },
          "timestamp-diff": {
            $sum: { $cond: [{ $eq: ["$type", "timestamp-diff"] }, 1, 0] },
          },
          "invalid-signers-number": {
            $sum: {
              $cond: [{ $eq: ["$type", "invalid-signers-number"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          errors: "$errors",
          warnings: "$warnings",
          groupedByType: {
            "data-service-failed": "$data-service-failed",
            "no-data-package": "$no-data-package",
            "timestamp-diff": "$timestamp-diff",
            "one-url-failed": "$one-url-failed",
            "invalid-signers-number": "$invalid-signers-number",
          },
        },
      },
    ]);
  };
}
