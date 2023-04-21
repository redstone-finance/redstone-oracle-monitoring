import { askUserForTimeframe } from "../helpers/ask-user-timeframe";
import { generateIssuesAnalysis } from "./generate-issues-analysis";
import { connectToRemoteMongo } from "../helpers/db-connector";
import { log } from "../helpers/nice-logger";

(async () => {
  await connectToRemoteMongo();

  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const analysis = await generateIssuesAnalysis(fromTimestamp, toTimestamp);
  log(analysis);

  process.exit(); // It will handle closing DB connection
})();
