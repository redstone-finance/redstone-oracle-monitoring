import { aggregateMetricsQuery } from "../helpers/aggregate-metrics";
import { parseArrayToObject } from "../helpers/parse-array-to-object";

export const generateMetricsAnalysis = async (
  fromTimestamp: number,
  toTimestamp: number
) => {
  const groupedMetrics = await aggregateMetricsQuery(fromTimestamp);
  const parsedGroupedMetrics = parseArrayToObject(groupedMetrics);

  return {
    fromTimestamp: `${fromTimestamp} ${new Date(fromTimestamp)}`,
    toTimestamp: `${toTimestamp} ${new Date(toTimestamp)}`,
    metrics: parsedGroupedMetrics,
  };
};
