const plotly = require("plotly")("hatskier", "vyujwn0zVNWbWR73W5Jh");
import { Model } from "mongoose";
import open from "open";
import prompts from "prompts";
import { askUserForTimeframe } from "src/shared/ask-user-timeframe";
import { Metric } from "src/modules/metrics/metrics.model";
import { connectToRemoteMongo } from "src/shared/db-connector";
import { Metric as MetricType } from "../../shared/types";

export const fetchMetricsByFromDate = async (
  model: Model<MetricType>,
  fromTimestamp: number
) => {
  const fromTimestampCondition = {
    timestamp: {
      $gte: fromTimestamp,
    },
  };

  return await model.find(fromTimestampCondition);
};

(async () => {
  await connectToRemoteMongo();

  const toTimestamp = Date.now();
  const { fromTimestamp } = await askUserForTimeframe(toTimestamp);
  const metrics = await fetchMetricsByFromDate(Metric, fromTimestamp);
  const uniqueMetricsNames = [...new Set(metrics.map((metric) => metric.name))];

  const response = await prompts({
    type: "select",
    name: "metricName",
    message: "Select metric name",
    choices: uniqueMetricsNames.map((name) => ({
      title: name,
      value: name,
    })),
    initial: 0,
  });

  const timestamps = [];
  const values = [];
  metrics.forEach((metric) => {
    if (metric.name === response.metricName) {
      timestamps.push(new Date(metric.timestamp));
      values.push(metric.value);
    }
  });

  const data = [
    {
      x: timestamps,
      y: values,
      type: "bar",
    },
  ];
  const layout = {
    fileopt: "overwrite",
    filename: "metrics-report-" + Date.now(),
  };

  plotly.plot(data, layout, async (error: any, message: any) => {
    if (error) {
      return console.log(error);
    }
    console.log(message);
    await open(message.url);
    process.exit(); // It will handle closing DB connection
  });
})();
