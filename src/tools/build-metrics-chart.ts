const plotly = require("plotly")("hatskier", "vyujwn0zVNWbWR73W5Jh");
import open from "open";
import prompts from "prompts";
import { askUserForTimeframe } from "../utils/ask-user-timeframe";
import { fetchMetricsByFromDate } from "../utils/fetch-metrics-by-from-date";

(async () => {
  const { fromTimestamp } = await askUserForTimeframe();
  const metrics = await fetchMetricsByFromDate(fromTimestamp);
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
  });
})();
