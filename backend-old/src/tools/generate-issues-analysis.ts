import { aggregateIssuesByAttribute } from "../helpers/aggregate-issues";
import { parseArrayToObject } from "../helpers/parse-array-to-object";

export const generateIssuesAnalysis = async (
  fromTimestamp: number,
  toTimestamp: number
) => {
  const groupedByDataFeed = await aggregateIssuesByAttribute(
    fromTimestamp,
    "dataFeedId"
  );
  const groupedByUrls = await aggregateIssuesByAttribute(fromTimestamp, "url");

  const parsedGroupedByDataFeed = parseArrayToObject(groupedByDataFeed);
  const parsedGroupedByUrls = parseArrayToObject(groupedByUrls);

  return {
    fromTimestamp: `${fromTimestamp} ${new Date(fromTimestamp)}`,
    toTimestamp: `${toTimestamp} ${new Date(toTimestamp)}`,
    groupedByDataFeed: parsedGroupedByDataFeed,
    groupedByUrls: parsedGroupedByUrls,
  };
};
