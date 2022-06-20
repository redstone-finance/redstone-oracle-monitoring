import { Injectable } from "@nestjs/common";
import { parseArrayToObject } from "src/shared/parse-array-to-object";
import { Metric } from "./metrics.model";

@Injectable()
export class MetricsService {
  getMetricsByTimeframe(timeframe: number, name: string) {
    const toTimestamp = Date.now();
    const fromTimestamp = toTimestamp - timeframe;
    return this.fetchMetricsByName(fromTimestamp, name);
  }

  getMetricsNames() {
    return this.fetchMetricsNames();
  }

  fetchMetricsByName(fromTimestamp: number, name: string) {
    const condition = {
      timestamp: {
        $gte: fromTimestamp,
      },
      name: {
        $eq: name,
      },
    };
    return Metric.find(condition);
  }

  fetchMetricsNames() {
    return Metric.distinct("name");
  }

  aggregateMetricsQuery(fromTimestamp: number) {
    return Metric.aggregate([
      {
        $match: {
          timestamp: {
            $gte: fromTimestamp,
          },
        },
      },
      {
        $group: {
          _id: "$name",
          min: { $min: "$value" },
          max: { $max: "$value" },
          avg: { $avg: "$value" },
          numberOfSavedValues: { $sum: 1 },
        },
      },
      {
        $sort: { numberOfSavedValues: -1 },
      },
    ]);
  }

  async generateMetricsAnalysis(fromTimestamp: number, toTimestamp: number) {
    const groupedMetrics = await this.aggregateMetricsQuery(fromTimestamp);
    const parsedGroupedMetrics = parseArrayToObject(groupedMetrics);

    return {
      fromTimestamp: `${fromTimestamp} ${new Date(fromTimestamp)}`,
      toTimestamp: `${toTimestamp} ${new Date(toTimestamp)}`,
      metrics: parsedGroupedMetrics,
    };
  }
}
