import { askUserForTimeframe } from "../utils/ask-user-timeframe";
import { fetchMetricsByFromDate } from "../utils/fetch-metrics-by-from-date";
import { groupMetrics } from "../utils/group-metrics";
import { log } from "../utils/nice-logger";

(async () => {
  const { fromTimestamp, toTimestamp } = await askUserForTimeframe();

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
