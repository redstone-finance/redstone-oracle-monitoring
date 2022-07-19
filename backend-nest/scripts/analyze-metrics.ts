import { log } from "console";
import { connectToRemoteMongo } from "src/shared/db-connector";
import { askUserForTimeframe } from "src/shared/ask-user-timeframe";
import { MetricsService } from "src/modules/metrics/metrics.service";

(async () => {
  await connectToRemoteMongo();

  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const metricsService = new MetricsService();
  const analysis = await metricsService.generateMetricsAnalysis(
    fromTimestamp,
    toTimestamp
  );
  log(analysis);

  process.exit(); // It will handle closing DB connection
})();
