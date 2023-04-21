import { Model } from "mongoose";
import { log } from "console";
import { askUserForTimeframe } from "scripts/ask-user-timeframe";
import { IssuesService } from "../src/modules/issues/issues.service";
import { connectToRemoteMongo } from "scripts/db-connector";
import { IssueDocument } from "../src/modules/issues/issues.schema";

(async () => {
  await connectToRemoteMongo();

  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const issueModel = new Model<IssueDocument>();
  const issuesService = new IssuesService(issueModel);
  const analysis = await issuesService.generateIssuesAnalysis(
    fromTimestamp,
    toTimestamp
  );
  log(analysis);

  process.exit(); // It will handle closing DB connection
})();
