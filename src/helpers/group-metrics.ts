import { Metric } from "../models/metric";
import { calculateAverage } from "./math-helpers";
import { calculateMedian } from "./math-helpers";

export const groupMetrics = (metrics: Metric[], uniqueNames: string[]) => {
  const groupedMetrics = {};
  uniqueNames.forEach((name) => {
    const filteredMetricsValues = metrics.reduce((array, metric) => {
      if (metric.name === name) {
        array.push(metric.value);
      }
      return array;
    }, [] as number[]);

    groupedMetrics[name] = {
      min: Math.min(...filteredMetricsValues),
      max: Math.max(...filteredMetricsValues),
      avg: Math.round(calculateAverage(filteredMetricsValues)),
      median: calculateMedian(filteredMetricsValues),
      numberOfSavedValues: filteredMetricsValues.length,
    };
  });
  return groupedMetrics;
};
