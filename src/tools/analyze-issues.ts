import { generateIssueAnalysis } from "../helpers/aggregate-issues";
import { askUserForTimeframe } from "../helpers/ask-user-timeframe";
import { log } from "../helpers/nice-logger";

(async () => {
  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const analysis = await generateIssueAnalysis(fromTimestamp, toTimestamp);
  log(analysis);
})();
