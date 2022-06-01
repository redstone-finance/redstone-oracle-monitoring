import { generateIssueAnalysis } from "../helpers/aggregate-issues";
import { askUserForTimeframe } from "../helpers/ask-user-timeframe";
import { connectToRemoteMongo } from "../helpers/db-connector";
import { log } from "../helpers/nice-logger";

(async () => {
  await connectToRemoteMongo();

  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const analysis = await generateIssueAnalysis(fromTimestamp, toTimestamp);
  log(analysis);

  process.exit(); // It will handle closing DB connection
})();
