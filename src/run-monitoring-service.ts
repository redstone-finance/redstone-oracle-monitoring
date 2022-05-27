import schedule from "node-schedule";
import consola from "consola";
import redstone from "redstone-api-extended";
import { emailNotifierJobSchedule, dataFeedsToCheck } from "./config";
import { connectToRemoteMongo } from "./helpers/db-connector";
import { execute as executeEmailNotifierJob } from "./jobs/notifier-job";
import { execute as executeDataFeedCheckerJob } from "./jobs/data-feed-checker-job";
import { execute as executeSingleSourceCheckerJob } from "./jobs/single-source-checker-job";
import { DataFeedId } from "redstone-api-extended/lib/oracle/redstone-data-feed";

const logger = consola.withTag("run-monitoring-service");

runMonitoringService();

function runMonitoringService() {
  // Connect to mongoDB
  logger.info("Connecting to MongoDB");
  connectToRemoteMongo();

  // Starting email notifier job
  logger.info("Starting the email notifier job");
  schedule.scheduleJob(emailNotifierJobSchedule, executeEmailNotifierJob);

  // Starting data feed checker jobs
  for (const dataFeed of dataFeedsToCheck) {
    // Starting job for checking whole data package fetching
    // (without specified symbol)
    if (dataFeed.checkWithoutSymbol) {
      logger.info(`Starting data feed checker job for: ${dataFeed.id}`);
      schedule.scheduleJob(dataFeed.schedule, () =>
        executeDataFeedCheckerJob({
          dataFeedId: dataFeed.id as DataFeedId,
        })
      );
    }

    // Starting jobs for each symbol checking
    if (dataFeed.symbolsToCheck && dataFeed.symbolsToCheck.length > 0) {
      for (const symbol of dataFeed.symbolsToCheck) {
        logger.info(
          `Starting data feed checker job for: ${dataFeed.id} with symbol: ${symbol}`
        );
        schedule.scheduleJob(dataFeed.schedule, () =>
          executeDataFeedCheckerJob({
            dataFeedId: dataFeed.id as DataFeedId,
            symbol,
          })
        );
      }
    }

    // Starting jobs for each single source
    if (dataFeed.checkEachSingleSource) {
      const dataFeedSourcesConfig = redstone.oracle.getDefaultDataSourcesConfig(
        dataFeed.id as DataFeedId
      );
      for (const source of dataFeedSourcesConfig.sources) {
        logger.info(`Starting single source checker job for: ${dataFeed.id}`);
        schedule.scheduleJob(dataFeed.schedule, () =>
          executeSingleSourceCheckerJob({
            dataFeedId: dataFeed.id as DataFeedId,
            minTimestampDiffForWarning: dataFeed.minTimestampDiffForWarning,
            sourcesConfig: {
              ...dataFeedSourcesConfig,
              sources: [source],
            },
          })
        );
      }
    }
  }
}
