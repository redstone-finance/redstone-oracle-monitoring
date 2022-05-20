import { askUserForTimeframe } from "../helpers/ask-user-timeframe";
import { fetchByFromDate } from "../helpers/fetch-by-from-date";
import { groupIssuesByAttribute } from "../helpers/group-issues-by-attribute";
import { log } from "../helpers/nice-logger";
import { Issue } from "../models/issue";

(async () => {
  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const issues = await fetchByFromDate<Issue>(Issue, fromTimestamp);
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

  log(analysis);
})();
