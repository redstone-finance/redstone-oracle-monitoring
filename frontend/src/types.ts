import { Metric } from "../../shared/types";

export interface MetricNamesResponse {
  names: string[];
}

export interface MetricsResponse {
  metrics: Metric[];
}

export interface IssuesResponse {
  issuesAnalysis: {
    fromTimestamp: string;
    groupedByDataFeed: {
      dataFeedId: string;
      errors: number;
      groupedByType: {
        "data-feed-failed": number;
        "one-source-failed": number;
        "timestamp-diff": number;
      };
      warnings: number;
    }[];
    groupedByUrls: {
      url: string;
      errors: number;
      groupedByType: {
        "data-feed-failed": number;
        "one-source-failed": number;
        "timestamp-diff": number;
      };
      warnings: number;
    }[];
    toTimestamp: string;
  };
  metricsAnalysis: {
    fromTimestamp: string;
    metrics: {
      avg: number;
      name: string;
      max: number;
      min: number;
      numberOfSavedValues: number;
    }[];
    toTimestamp: string;
  };
}

export interface SelectOption<T> {
  label: string;
  value: T;
}
