import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { parseArrayToObject } from "../../shared/parse-array-to-object";
import { Metric, MetricDocument } from "./metrics.schema";

@Injectable()
export class MetricsService {
  constructor(
    @InjectModel(Metric.name) private metricModel: Model<MetricDocument>
  ) {}

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
    return this.metricModel.find(condition);
  }

  fetchMetricsNames() {
    return this.metricModel.distinct("name");
  }

  aggregateMetricsQuery(fromTimestamp: number) {
    return this.metricModel.aggregate([
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
