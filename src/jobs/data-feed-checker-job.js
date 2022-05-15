const redstone = require("redstone-api-extended");
const consola = require("consola");
const Issue = require("../models/issue");
const { stringifyError } = require("../helpers/error-stringifier");

async function execute({ dataFeedId, symbol }) {
  const logger = consola.withTag(
    `data-feed-checker-job-${dataFeedId}-${symbol}`
  );
  logger.info(
    `Checking data feed: ${dataFeedId}${symbol ? " with symbol " + symbol : ""}`
  );
  const currentTimestamp = Date.now();

  try {
    await redstone.oracle.getFromDataFeed(dataFeedId, symbol);
  } catch (e) {
    const errStr = stringifyError(e);
    logger.error(
      `Error occured in data feed checker-job ` +
        `(${dataFeedId}-${symbol}). ` +
        `Saving issue in DB: ${errStr}`
    );
    await new Issue({
      timestamp: currentTimestamp,
      type: "data-feed-failed",
      symbol,
      level: "ERROR",
      dataFeedId,
      comment: errStr,
    }).save();
  }
}

module.exports = {
  execute,
};
