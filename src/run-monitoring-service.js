const schedule = require("node-schedule");
const consola = require("consola");
const config = require("../default-data-sources/redstone-avalanche.json");
const { connectToRemoteMongo } = require("./db-connector");
const { execute: executeEmailNotifierJob } = require("./notifiers/email-notifier-job");
const ApiCheckerJob = require("./source-monitoring/api-source-checker-job");
const StreamrCheckerJob = require("./source-monitoring/streamr-checker-job");
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

    switch (source.type) {
      case "streamr":
      case "streamr-storage":
        StreamrChecker = new StreamrCheckerJob();
        await StreamrChecker.execute(source);
        break;
      case "cache-layer":
        ApiChecker = new ApiCheckerJob();
        await ApiChecker.execute(source);
        break;
    }
  });
}
