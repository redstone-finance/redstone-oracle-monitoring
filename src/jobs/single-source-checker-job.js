const redstone = require("redstone-api-extended");
const consola = require("consola");
const Metric = require("../models/metric");
const Issue = require("../models/issue");

const logger = consola.withTag("email-notifier-job");

async function execute({
  dataFeedId,
  minTimestampDiffForWarning,
  sourcesConfig,
}) {
  logger.info(
    `Checking a single source in data feed: ${dataFeedId}. ` +
      `Source config: ${sourcesConfig}`
  );
  const currentTimestamp = Date.now();
  const singleSourceConfig = sourcesConfig.sources[0];
  const dataSourceName = `${dataFeedId}-${singleSourceConfig.type}-${singleSourceConfig.url}`;

  try {
    // Trying to fetch from redstone
    const response = await redstone.oracle.get({
      ...sourcesConfig,
      maxTimestampDiffMilliseconds: 28 * 24 * 3600 * 1000, // 28 days - we don't want to raise error if data is too old
    });

    const timestampDiff = currentTimestamp - response.timestamp;

    // Saving metric to DB
    // TODO: add logging
    await new Metric({
      name: `timestamp-diff-${dataSourceName}`,
      value: timestampDiff,
      timestamp: currentTimestamp,
      tags: {
        dataFeedId,
        evmSignerAddress: singleSourceConfig.evmSignerAddress,
      },
    }).save();

    if (timestampDiff > minTimestampDiffForWarning) {
      // TODO: add logging
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
    // TODO: add logging
    await new Issue({
      timestamp: currentTimestamp,
      type: "one-source-failed",
      level: "ERROR",
      dataFeedId,
      evmSignerAddress: singleSourceConfig.evmSignerAddress,
      url: singleSourceConfig.url,
      comment: errStr,
    }).save();
  }
}

module.exports = {
  execute,
};
