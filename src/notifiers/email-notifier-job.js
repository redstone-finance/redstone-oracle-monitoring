const consola = require("consola");

const mongodbInfo = require("../../.secrets/mongodb.json");
const Notification = require("../models/notification");
const Mail = require("../models/mail");
//const { notify } = require("./email-notifier-mailgun");   TODO
const { notify } = require("./email-notifier-ses.js");

const MIN_MAIL_INTERVAL = 3 * 3600 * 1000; // 3 hours
const MONGO_DASHBOARD_URL = mongodbInfo.mongoDashboardURL;
const ERRORS_LIMIT = 5;

const logger = consola.withTag("email-notifier-job");

// Counts warnings and errors for the last 6 minutes
async function execute() {
  const currentTimestamp = Date.now();
  const minTimestamp = currentTimestamp - MIN_MAIL_INTERVAL;

  const lastSentMailCount = await Mail.countDocuments({
    timestamp: { $gte: minTimestamp }
  }).exec();
  if (lastSentMailCount > 0) {
    logger.info('Sent more than 1 mail lately. Mail sending skipped.');
    return;
  }

  const errors = await Notification.countDocuments({
    timestamp: { $gte: minTimestamp },
    level: "ERROR",
  });

  const warnings = await Notification.countDocuments({
    timestamp: { $gte: minTimestamp },
    level: "WARNING",
  });

  const lastErrors = await Notification.find({
    timestamp: { $gte: minTimestamp },
    level: "ERROR",
  }).limit(ERRORS_LIMIT);

  const message = "Hello devs!\n\n"
    + "Here is a short report from redstone-node-monitoring tool for last 5 minutes.\n"
    + JSON.stringify({
      errors,
      warnings,
      url: MONGO_DASHBOARD_URL,
      mongoQueryForErrors: {
        timestamp: { $gte: minTimestamp, $lte: currentTimestamp },
        level: "ERROR",
      },
      mongoQueryForWarnings: {
        timestamp: { $gte: minTimestamp, $lte: currentTimestamp },
        level: "WARNING",
      },
      lastErrors,
    }, null, 2);

  let subject = "", shouldSend = true;
  if (errors > 0) {
    subject = `[ERROR] - please check ${errors} errors`;
  } else if (warnings > 0) {
    subject = `[WARNING] - please check ${warnings} warnings`;
  } else {
    shouldSend = false;
  }

  if (shouldSend) {
    logger.info('Sending new email notification');
    const sentReport = await notify(subject, message);
    await new Mail({ timestamp: currentTimestamp }).save();
    logger.info('Email sent: ' + JSON.stringify(sentReport));
  } else {
    logger.info('No new notifications to send. Skipping...');
  }

}

module.exports = {
  execute,
};
