import prompts from "prompts";
import {
  MONTH_IN_HOURS,
  HOUR_IN_MILLISECONDS,
  WEEK_IN_HOURS,
  TWO_WEEKS_IN_HOURS,
} from "../../shared/constants";

export const askUserForTimeframe = async (toTimestamp: number) => {
  const response = await prompts({
    type: "select",
    name: "timeFrame",
    message: "Select time frame for issues",
    choices: [
      { title: "Last hour", value: 1 },
      { title: "Last day", value: 24 },
      { title: "Last week", value: WEEK_IN_HOURS },
      { title: "Last two weeks", value: TWO_WEEKS_IN_HOURS },
      { title: "Last month", value: MONTH_IN_HOURS },
    ],
    initial: 0,
  });
  const timeFrameInHours = response.timeFrame;
  const timestampDiff = timeFrameInHours * HOUR_IN_MILLISECONDS;
  const fromTimestamp = toTimestamp - timestampDiff;

  return { fromTimestamp, toTimestamp };
};
