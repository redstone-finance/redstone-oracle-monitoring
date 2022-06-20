import { log } from "console";
import { askUserForTimeframe } from "src/shared/ask-user-timeframe";
import { IssuesService } from "src/modules/issues/issues.service";
import { connectToRemoteMongo } from "src/shared/db-connector";

(async () => {
  await connectToRemoteMongo();

  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const issuesService = new IssuesService();
  const analysis = await issuesService.generateIssuesAnalysis(
    fromTimestamp,
    toTimestamp
  );
  log(analysis);

  process.exit(); // It will handle closing DB connection
})();
