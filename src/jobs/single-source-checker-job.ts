import redstone from "redstone-api-extended";
import consola, { Consola } from "consola";
import { Metric } from "../models/metric";
import { Issue } from "../models/issue";
import { stringifyError } from "../helpers/error-stringifier";
import {
  DataFeedId,
  DataSourcesConfig,
} from "redstone-api-extended/lib/oracle/redstone-data-feed";
import { SourceConfig } from "redstone-api-extended/lib/oracle/fetchers/Fetcher";

interface Input {
  dataFeedId: DataFeedId;
  minTimestampDiffForWarning: number;
  sourcesConfig: DataSourcesConfig;
}

export const execute = async ({
  dataFeedId,
  minTimestampDiffForWarning,
  sourcesConfig,
}: Input) => {
  const currentTimestamp = Date.now();
  const singleSourceConfig = sourcesConfig.sources[0];
  const dataSourceName = `${dataFeedId}-${singleSourceConfig.type}-${singleSourceConfig.url}-${evmSignerAddress}`;
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
};

interface SaveMetricInput {
  logger: Consola;
  metricName: string;
  timestampDiff: number;
  timestamp: number;
  dataFeedId: DataFeedId;
  singleSourceConfig: SourceConfig;
}

const safelySaveMetricInDB = async ({
  logger,
  metricName,
  timestampDiff,
  timestamp,
  dataFeedId,
  singleSourceConfig,
}: SaveMetricInput) => {
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
};
