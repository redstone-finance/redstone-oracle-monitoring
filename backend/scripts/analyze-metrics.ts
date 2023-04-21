import { Model } from "mongoose";
import { log } from "console";
import { connectToRemoteMongo } from "scripts/db-connector";
import { askUserForTimeframe } from "scripts/ask-user-timeframe";
import { MetricsService } from "../src/modules/metrics/metrics.service";
import { MetricDocument } from "../src/modules/metrics/metrics.schema";

(async () => {
  await connectToRemoteMongo();

  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const metricModel = new Model<MetricDocument>();
  const metricsService = new MetricsService(metricModel);
  const analysis = await metricsService.generateMetricsAnalysis(
    fromTimestamp,
    toTimestamp
  );
  log(analysis);

  process.exit(); // It will handle closing DB connection
})();
