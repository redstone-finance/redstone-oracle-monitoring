import { Metric } from "../models/metric";

export const fetchMetricsNames = () => Metric.distinct("name");
