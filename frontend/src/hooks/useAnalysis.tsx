import { Dispatch, SetStateAction } from "react";
import { useQuery } from "react-query";
import {
  IssuesResponse,
  MetricNamesResponse,
  MetricsResponse,
  SelectOption,
} from "../types";

const backendUrl = process.env.BACKEND_URL;

export const useAnalysis = (
  selectedTimeframe: number,
  setSelectedMetricName: Dispatch<SetStateAction<SelectOption<string> | null>>,
  selectedMetricName?: string
) => {
  const metricsNamesQuery = useQuery<MetricNamesResponse>(
    "metricsNames",
    async () => {
      const url = `${backendUrl}/metrics/metrics-names`;
      const response = await fetch(url);
      return response.json();
    },
    {
      onSuccess: (data) =>
        setSelectedMetricName({ label: data.names[0], value: data.names[0] }),
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    }
  );

  const metricsQuery = useQuery<MetricsResponse>(
    ["metrics", selectedTimeframe, selectedMetricName],
    async () => {
      const url = `${backendUrl}/metrics/${selectedTimeframe}?name=${selectedMetricName}`;
      const response = await fetch(url);
      return response.json();
    },
    {
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    }
  );

  const issuesQuery = useQuery<IssuesResponse>(
    ["issues", selectedTimeframe],
    async () => {
      const url = `${backendUrl}/issues/${selectedTimeframe}`;
      const response = await fetch(url);
      return response.json();
    },
    {
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    }
  );

  return { metricsNamesQuery, metricsQuery, issuesQuery };
};
