import { askUserForTimeframe } from "../helpers/ask-user-timeframe";
import { log } from "../helpers/nice-logger";
import { aggregateMetricsQuery } from "../helpers/aggregate-metrics";
import { connectToRemoteMongo } from "../helpers/db-connector";

(async () => {
  await connectToRemoteMongo();

  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const groupedMetrics = await aggregateMetricsQuery(fromTimestamp);

  const analysis = {
    fromTimestamp: `${fromTimestamp} ${new Date(fromTimestamp)}`,
    toTimestamp: `${toTimestamp} ${new Date(toTimestamp)}`,
    metrics: groupedMetrics,
  };
  log(analysis);

  process.exit(); // It will handle closing DB connection
})();
