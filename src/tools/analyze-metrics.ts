import { askUserForTimeframe } from "../helpers/ask-user-timeframe";
import { log } from "../helpers/nice-logger";
import { aggregateMetricsQuery } from "../helpers/aggregate-metrics";

(async () => {
  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const groupedMetrics = await aggregateMetricsQuery(fromTimestamp);

  const analysis = {
    fromTimestamp: `${fromTimestamp} ${new Date(fromTimestamp)}`,
    toTimestamp: `${toTimestamp} ${new Date(toTimestamp)}`,
    metrics: groupedMetrics,
  };
  log(analysis);
})();
