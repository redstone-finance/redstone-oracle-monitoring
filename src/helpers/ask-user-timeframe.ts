import prompts from "prompts";

const ONE_HOUR_IN_MILLISECONDS = 3600 * 1000;
const WEEK_IN_HOURS = 24 * 7;
const MONTH_IN_HOURS = 24 * 30;

export const askUserForTimeframe = async (toTimestamp: number) => {
  const response = await prompts({
    type: "select",
    name: "timeFrame",
    message: "Select time frame for issues",
    choices: [
      { title: "Last hour", value: 1 },
      { title: "Last day", value: 24 },
      { title: "Last week", value: WEEK_IN_HOURS },
      { title: "Last month", value: MONTH_IN_HOURS },
    ],
    initial: 0,
  });
  const timeFrameInHours = response.timeFrame;
  const timestampDiff = timeFrameInHours * ONE_HOUR_IN_MILLISECONDS;
  const fromTimestamp = toTimestamp - timestampDiff;

  return { fromTimestamp, toTimestamp };
};
