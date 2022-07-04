import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Select from "react-select";
import Card from "../components/Card";
import JsonViewer from "../components/JsonViewer";
import Loader from "../components/Loader";
import { useAnalysis } from "../hooks/useAnalysis";
import {
  DAY_IN_MILLISECONDS,
  HOUR_IN_MILLISECONDS,
  MONTH_IN_MILLISECONDS,
  TWO_WEEKS_IN_MILLISECONDS,
  WEEK_IN_MILLISECONDS,
} from "../../../shared/constants";
import { SelectOption } from "../types";

const timeframesOptions = [
  {
    value: HOUR_IN_MILLISECONDS,
    label: "One hour",
  },
  {
    value: DAY_IN_MILLISECONDS,
    label: "One day",
  },
  {
    value: WEEK_IN_MILLISECONDS,
    label: "One week",
  },
  {
    value: TWO_WEEKS_IN_MILLISECONDS,
    label: "Two weeks",
  },
  {
    value: MONTH_IN_MILLISECONDS,
    label: "One month",
  },
];

const AnalysisPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    SelectOption<number>
  >(timeframesOptions[0]);
  const [selectedMetricName, setSelectedMetricName] =
    useState<SelectOption<string> | null>(null);

  const { metricsNamesQuery, metricsQuery, issuesQuery } = useAnalysis(
    selectedTimeframe.value,
    setSelectedMetricName,
    selectedMetricName?.value
  );

  if (
    metricsNamesQuery.isLoading ||
    !metricsNamesQuery.data ||
    metricsQuery.isLoading ||
    !metricsQuery.data ||
    issuesQuery.isLoading ||
    !issuesQuery.data
  ) {
    return <Loader />;
  }

  const issuesByDataFeed = issuesQuery.data.issuesAnalysis.groupedByDataFeed;
  const issuesByUrl = issuesQuery.data.issuesAnalysis.groupedByUrls;

  return (
    <div>
      <div className="w-full max-w-5xl flex mx-auto">
        <div className="w-full flex justify-end mb-3">
          <Select
            value={selectedTimeframe}
            onChange={setSelectedTimeframe as any}
            options={timeframesOptions}
            isClearable={false}
          />
        </div>
      </div>
      <Card>
        <div className="mb-3">
          <Select
            value={selectedMetricName}
            onChange={setSelectedMetricName}
            options={metricsNamesQuery.data?.names?.map((name) => ({
              value: name,
              label: name,
            }))}
            defaultValue={selectedMetricName}
          />
        </div>
        <ResponsiveContainer width="100%" height={500}>
          {metricsQuery.data.metrics.length === 0 ? (
            <div className="flex h-[500px] items-center justify-center">
              <p>No Data</p>
            </div>
          ) : (
            <BarChart data={metricsQuery.data.metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(unixTime) => {
                  if (
                    selectedTimeframe?.value === HOUR_IN_MILLISECONDS ||
                    selectedTimeframe?.value === DAY_IN_MILLISECONDS
                  ) {
                    return new Date(unixTime).toLocaleTimeString();
                  }
                  return new Date(unixTime).toLocaleDateString();
                }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Card>
      <div className="flex flex-col gap-5">
        <JsonViewer json={issuesByDataFeed} title="Issues by Data feed" />
        <JsonViewer json={issuesByUrl} title="Issues by URL" />
      </div>
    </div>
  );
};

export default AnalysisPage;
