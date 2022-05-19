import { IMetric } from "../models/metric";
import { calculateAverage } from "./calculate-average";
import { calculateMedian } from "./calculate-median";

export const groupMetrics = (metrics: IMetric[], uniqueNames: string[]) => {
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
