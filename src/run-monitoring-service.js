const schedule = require("node-schedule");
const consola = require("consola");
const config = require("../default-data-sources/redstone-avalanche.json");
const { connectToRemoteMongo } = require("./db-connector");
const { execute: executeEmailNotifierJob } = require("./notifiers/email-notifier-job");
const JobApi = require("./source-monitoring/api-source-checker-job");
const JobStreamr = require("./source-monitoring/streamr-checker-job");
const EVERY_10_SECONDS = "*/10 * * * * *";

connectToRemoteMongo();
const logger = consola.withTag("run-monitoring-service.js");


logger.info("Starting the email notifier job");
schedule.scheduleJob(EVERY_10_SECONDS, async () => {
  logger.info("Email notifier iteration started");
  await executeEmailNotifierJob();
});


logger.info("Starting Api source monitoring jobs");
for (const source of (config.sources).filter((source) => source.type == "cache-layer")) {
  logger.info("Starting a new source checker job with scehdule: " + source.schedule);
  schedule.scheduleJob(source.schedule, async () => {
    logger.info("Source checker iteration started");
    jobApi = new JobApi();
    await jobApi.execute(source);
  });
}

logger.info("Starting Streamr source monitoring jobs");
for (const source of (config.sources).filter((source) => source.type == "streamr-storage")) {
  logger.info("Starting a new source checker job with scehdule: " + source.schedule);
  schedule.scheduleJob(source.schedule, async () => {
    logger.info("Source checker iteration started");
    jobStreamr = new JobStreamr();
    await jobStreamr.execute(source);
  });
}

