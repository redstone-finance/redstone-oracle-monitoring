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
        "data-service-failed": number;
        "one-url-failed": number;
        "timestamp-diff": number;
        "no-data-package": number;
        "invalid-signers-number": number;
      };
      warnings: number;
    }[];
    groupedByUrls: {
      url: string;
      errors: number;
      groupedByType: {
        "data-service-failed": number;
        "one-url-failed": number;
        "timestamp-diff": number;
        "no-data-package": number;
        "invalid-signers-number": number;
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
