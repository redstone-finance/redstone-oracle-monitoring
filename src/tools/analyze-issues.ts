import { aggregateIssuesByAttribute } from "../helpers/aggregate-issues";
import { askUserForTimeframe } from "../helpers/ask-user-timeframe";
import { log } from "../helpers/nice-logger";

(async () => {
  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const groupedByDataFeed = await aggregateIssuesByAttribute(
    fromTimestamp,
    "dataFeedId"
  );
  const groupedByUrls = await aggregateIssuesByAttribute(fromTimestamp, "url");

  const analysis = {
    fromTimestamp: `${fromTimestamp} ${new Date(fromTimestamp)}`,
    toTimestamp: `${toTimestamp} ${new Date(toTimestamp)}`,
    groupedByDataFeed,
    groupedByUrls,
  };
  log(analysis);
})();
