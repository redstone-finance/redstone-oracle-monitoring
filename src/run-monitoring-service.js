const schedule = require("node-schedule");
const consola = require("consola");
const redstone = require("redstone-api-extended");

const config = require("./config");
const { connectToRemoteMongo } = require("./db-connector");
const emailNotifierJob = require("./jobs/email-notifier-job");
const dataFeedCheckerJob = require("./jobs/data-feed-checker-job");
const singleSourceCheckerJob = require("./jobs/single-source-checker-job");

const logger = consola.withTag("run-monitoring-service");

runMonitoringService();

function runMonitoringService() {
  // Connect to mongoDB
  logger.info("Connecting to MongoDB");
  connectToRemoteMongo();

  // Starting email notifier job
  logger.info("Starting the email notifier job");
  schedule.scheduleJob(
    config.emailNotifierJobSchedule,
    emailNotifierJob.execute
  );

  // Starting data feed checker jobs
  for (const dataFeed of config.dataFeedsToCheck) {
    // Starting job for checking whole data package fetching
    // (without specified symbol)
    if (dataFeed.checkWithoutSymbol) {
      logger.info(`Starting data feed checker job for: ${dataFeed.id}`);
      schedule.scheduleJob(dataFeed.schedule, () =>
        dataFeedCheckerJob.execute({
          dataFeedId: dataFeed.id,
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
          dataFeedCheckerJob.execute({
            dataFeedId: dataFeed.id,
            symbol,
          })
        );
      }
    }

    // Starting jobs for each single source
    if (dataFeed.checkEachSingleSource) {
      const dataFeedSourcesConfig = redstone.oracle.getDefaultDataSourcesConfig(
        dataFeed.id
      );
      for (const source of dataFeedSourcesConfig.sources) {
        logger.info(
          `Starting single source checker job for: ${dataFeed.id} (${symbol})`
        );
        schedule.scheduleJob(dataFeed.schedule, () =>
          singleSourceCheckerJob.execute({
            dataFeedId: dataFeed.id,
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
