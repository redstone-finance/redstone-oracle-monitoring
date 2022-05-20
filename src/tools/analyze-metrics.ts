import { askUserForTimeframe } from "../helpers/ask-user-timeframe";
import { fetchMetricsByFromDate } from "../helpers/fetch-metrics-by-from-date";
import { groupMetrics } from "../helpers/group-metrics";
import { log } from "../helpers/nice-logger";

(async () => {
  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);

  const metrics = await fetchMetricsByFromDate(fromTimestamp);
  const uniqueMetricsNames = [...new Set(metrics.map((metric) => metric.name))];
  const groupedMetrics = groupMetrics(metrics, uniqueMetricsNames);

  const analysis = {
    fromTimestamp: `${fromTimestamp} ${new Date(fromTimestamp)}`,
    toTimestamp: `${toTimestamp} ${new Date(toTimestamp)}`,
    metrics: groupedMetrics,
  };

  log(analysis);
})();
