const schedule = require("node-schedule");
const consola = require("consola");
const config = require("./monitoring-service-configuration");
const { connectToRemoteMongo } = require("./db-connector");
const { execute: executeEmailNotifierJob } = require("./notifiers/email-notifier-job");
const { execute: executeSourceCheckerJob } = require("./source-monitoring/source-checker-job");

const EVERY_10_SECONDS = "*/10 * * * * *";

connectToRemoteMongo();
const logger = consola.withTag("run-monitoring-service.js");

logger.info("Starting the email notifier job");
schedule.scheduleJob(EVERY_10_SECONDS, async () => {
  logger.info("Email notifier iteration started");
  await executeEmailNotifierJob();
});

logger.info("Starting source monitoring jobs");
for (const source of config.sources) {
  logger.info("Starting a new source checker job with scehdule: " + source.schedule);
  schedule.scheduleJob(source.schedule, async () => {
    logger.info("Source checker iteration started");
    await executeSourceCheckerJob(source);
  });
}

