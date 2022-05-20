import { askUserForTimeframe } from "../utils/ask-user-timeframe";
import { fetchIssuesByFromDate } from "../utils/fetch-issues-by-from-date";
import { groupIssuesByAttribute } from "../utils/group-issues-by-attribute";
import { log } from "../utils/nice-logger";

(async () => {
  const { fromTimestamp, toTimestamp } = await askUserForTimeframe();

  const analysis = await generateIssueAnalysis(fromTimestamp, toTimestamp);

  log(analysis);
})();

export const generateIssueAnalysis = async (
  fromTimestamp: number,
  toTimestamp: number
) => {
  const issues = await fetchIssuesByFromDate(fromTimestamp);
  const uniqueDataFeeds = [...new Set(issues.map((issue) => issue.dataFeedId))];
  const uniqueUrls = [...new Set(issues.map((issue) => issue.url))];

  const groupedByDataFeed = groupIssuesByAttribute(
    issues,
    uniqueDataFeeds,
    "dataFeedId"
  );
  const groupedByUrls = groupIssuesByAttribute(issues, uniqueUrls, "url");

  const analysis = {
    fromTimestamp: `${fromTimestamp} ${new Date(fromTimestamp)}`,
    toTimestamp: `${toTimestamp} ${new Date(toTimestamp)}`,
    groupedByDataFeed,
    groupedByUrls,
  };
};
