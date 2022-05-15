const redstone = require("redstone-api-extended");
const consola = require("consola");
const Metric = require("../models/metric");
const Issue = require("../models/issue");
const { stringifyError } = require("../helpers/error-stringifier");

async function execute({
  dataFeedId,
  minTimestampDiffForWarning,
  sourcesConfig,
}) {
  const currentTimestamp = Date.now();
  const singleSourceConfig = sourcesConfig.sources[0];
  const dataSourceName = `${dataFeedId}-${singleSourceConfig.type}-${singleSourceConfig.url}`;
  const logger = consola.withTag(`email-notifier-job-${dataSourceName}`);
  logger.info(
    `Checking a single source in data feed: ${dataFeedId}. ` +
      `Source config: ${JSON.stringify(singleSourceConfig)}`
  );

  try {
    // Trying to fetch from redstone
    const response = await redstone.oracle.get({
      ...sourcesConfig,
      maxTimestampDiffMilliseconds: 28 * 24 * 3600 * 1000, // 28 days - we don't want to raise error if data is too old
    });

    const timestampDiff = currentTimestamp - response.priceData.timestamp;

    // Saving metric to DB
    safelySaveMetricInDB({
      logger,
      metricName: `timestamp-diff-${dataSourceName}`,
      timestampDiff,
      timestamp: response.priceData.timestamp,
      dataFeedId,
      singleSourceConfig,
    });

    if (timestampDiff > minTimestampDiffForWarning) {
      logger.warn(
        `Timestamp diff is quite big: ${timestampDiff}. Saving issue in DB`
      );
      await new Issue({
        timestamp: currentTimestamp,
        type: "timestamp-diff",
        level: "WARNING",
        dataFeedId,
        evmSignerAddress: singleSourceConfig.evmSignerAddress,
        url: singleSourceConfig.url,
        timestampDiffMilliseconds: timestampDiff,
      }).save();
    }
  } catch (e) {
    const errStr = stringifyError(e);
    logger.error(`Error occured: ${errStr}. Saving issue in DB`);
    await new Issue({
      timestamp: currentTimestamp,
      type: "one-source-failed",
      level: "WARNING",
      dataFeedId,
      evmSignerAddress: singleSourceConfig.evmSignerAddress,
      url: singleSourceConfig.url,
      comment: errStr,
    }).save();
  }
}

async function safelySaveMetricInDB({
  logger,
  metricName,
  timestampDiff,
  timestamp,
  dataFeedId,
  singleSourceConfig,
}) {
  try {
    logger.info(
      `Saving metric to DB. Name: ${metricName}, Value: ${timestampDiff}`
    );
    await new Metric({
      name: metricName,
      value: timestampDiff,
      timestamp,
      tags: {
        dataFeedId,
        evmSignerAddress: singleSourceConfig.evmSignerAddress,
      },
    }).save();
  } catch (e) {
    logger.error(`Metric saving failed: ${stringifyError(e)}`);
  }
}

module.exports = {
  execute,
};
