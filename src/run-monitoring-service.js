const schedule = require("node-schedule");
const consola = require("consola");
const redstone = require("redstone-api-extended");

const config = require("./config");
const { connectToRemoteMongo } = require("./db-connector");
const { execute: executeEmailNotifierJob } = require("./notifiers/email-notifier-job");
const DataFeedCheckerJob = require("./source-monitoring/DataFeedCheckerJob");
const SingleSourceCheckerJob = require("./source-monitoring/SingleSourceCheckerJob");

connectToRemoteMongo();
const logger = consola.withTag("run-monitoring-service.js");


logger.info("Starting the email notifier job");
schedule.scheduleJob(config.checkerSchedule, async () => {
  logger.info("Email notifier iteration started");
  await executeEmailNotifierJob();
});


logger.info("Starting source monitoring jobs");
for (const dataFeedId of config.dataFeedIds) {
  const defaultDataFeedConfig = redstone.oracle.getDefaultDataSourcesConfig(dataFeedId);

  const job = new DataFeedCheckerJob(defaultDataFeedConfig, "ERROR", dataFeedId);
  schedule.scheduleJob(config.checkerSchedule, async () => {
    await job.execute();
  });

  for (const source of defaultDataFeedConfig.sources) {
    const configForSingleSource = {
      ...defaultDataFeedConfig,
      sources: [source],
    };
    const subJob = new SingleSourceCheckerJob(configForSingleSource, "WARNING");
    schedule.scheduleJob(config.checkerSchedule, async () => {
      await subJob.execute();
    });
  }
}
