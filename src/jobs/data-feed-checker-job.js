const redstone = require("redstone-api-extended");
const consola = require("consola");
const Issue = require("../models/issue");
const { stringifyError } = require("../helpers/error-stringifier");

const logger = consola.withTag("email-notifier-job");

async function execute({ dataFeedId, symbol }) {
  logger.info(
    `Checking data feed: ${dataFeedId}${symbol ? " with symbol " + symbol : ""}`
  );
  const currentTimestamp = Date.now();

  try {
    await redstone.oracle.getFromDataFeed(dataFeedId, symbol);
  } catch (e) {
    const errStr = stringifyError(e);
    logger.error(`Error occured. Saving issue in DB: errStr`);
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
