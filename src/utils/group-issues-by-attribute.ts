import { IIssue } from "../models/issue";

export const groupIssuesByAttribute = (
  issues: IIssue[],
  uniqueAttributes: string[],
  attributeName: keyof IIssue
) => {
  const groupedByAttribute = {};
  uniqueAttributes.forEach((attributeValue) => {
    let numberOfErrors = 0;
    let numberOfWarnings = 0;
    let numberOfDataFeedFailed = 0;
    let numberOfOneSourceFailed = 0;
    let numberOfTimestampDiff = 0;
    for (const issue of issues) {
      if (issue[attributeName] === attributeValue) {
        if (issue.level === "ERROR") {
          numberOfErrors++;
        } else if (issue.level === "WARNING") {
          numberOfWarnings++;
        }

        if (issue.type === "data-feed-failed") {
          numberOfDataFeedFailed++;
          break;
        } else if (issue.type === "one-source-failed") {
          numberOfOneSourceFailed++;
          break;
        } else if (issue.type === "timestamp-diff") {
          numberOfTimestampDiff++;
        }
      }
    }
    groupedByAttribute[attributeValue] = {
      errors: numberOfErrors,
      warnings: numberOfWarnings,
      groupedByType: {
        "data-feed-failed": numberOfDataFeedFailed,
        "one-source-failed": numberOfOneSourceFailed,
        "timestamp-diff": numberOfTimestampDiff,
      },
    };
  });
  return groupedByAttribute;
};
