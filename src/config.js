require("dotenv").config();

function getFromEnv(envName, defaultValue) {
  const valueFromEnv = process.env[envName];
  if (!valueFromEnv && defaultValue === undefined) {
    throw new Error(`Env ${envName} must be specified`);
  }
  return valueFromEnv;
}

module.exports = {
  mailgun: {
    domain: getFromEnv("MAILGUN_DOMAIN"),
    apiKey: getFromEnv("MAILGUN_API_KEY"),
  },
  mongoDbUrl: getFromEnv("MONGO_DB_URL"),
  metricsUrl: getFromEnv("METRICS_URL"),
  emailNotifierJobSchedule: "*/10 * * * * *", // Every 10 seconds
  dataFeedsToCheck: [
    {
      id: "redstone",
      checkWithoutSymbol: true,
      symbolsToCheck: ["ETH", "STX"],
      checkEachSingleSource: false,
      minTimestampDiffForWarning: 120000,
      schedule: "0 * * * *", // Every hour at 0th minute, e.g. 15:00, 16:00, 17:00, ...
    },
    {
      id: "redstone-stocks",
      checkWithoutSymbol: true,
      symbolsToCheck: ["AAPL"],
      checkEachSingleSource: true,
      minTimestampDiffForWarning: 120000,
      schedule: "5 * * * *", // Every hour at 5th minute, e.g. 15:05, 16:05
    },
    {
      id: "redstone-rapid",
      checkWithoutSymbol: true,
      symbolsToCheck: ["ETH"],
      checkEachSingleSource: true,
      minTimestampDiffForWarning: 20000,
      schedule: "10 * * * *", // Every hour at 10th minute
    },
    {
      id: "redstone-avalanche",
      checkWithoutSymbol: true,
      checkEachSingleSource: true,
      symbolsToCheck: ["AVAX"],
      minTimestampDiffForWarning: 20000,
      schedule: "15 * * * *", // Every hour at 15th minute
    },
    {
      id: "redstone-custom-urls-demo",
      checkWithoutSymbol: true,
      symbolsToCheck: [],
      checkEachSingleSource: true,
      minTimestampDiffForWarning: 120000,
      schedule: "20 * * * *", // Every hour at 20th minute
    },
    {
      id: "redstone-avalanche-prod",
      checkWithoutSymbol: true,
      symbolsToCheck: ["AVAX", "QI", "YAK"],
      checkEachSingleSource: true,
      minTimestampDiffForWarning: 20000,
      schedule: "*/10 * * * * *", // Every 10 seconds
    },
  ],
};
