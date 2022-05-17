import consola from "consola";

import { Issue } from "../models/issue";
import { Mail } from "../models/mail";
import { notify } from "../notifiers/email-notifier-mailgun";

const MIN_MAIL_INTERVAL = 3 * 3600 * 1000; // 3 hours
const MONGO_DASHBOARD_URL = "https://todo.implement.dashboard/";
const ERRORS_LIMIT = 5;

const logger = consola.withTag("email-notifier-job");

// Counts warnings and errors for the last 6 minutes
export const execute = async () => {
  const currentTimestamp = Date.now();
  const minTimestamp = currentTimestamp - MIN_MAIL_INTERVAL;

  const lastSentMailCount = await Mail.countDocuments({
    timestamp: { $gte: minTimestamp },
  }).exec();
  if (lastSentMailCount > 0) {
    logger.info("Sent more than 1 mail lately. Mail sending skipped.");
    return;
  }

  const errors = await Issue.countDocuments({
    timestamp: { $gte: minTimestamp },
    level: "ERROR",
  });

  const warnings = await Issue.countDocuments({
    timestamp: { $gte: minTimestamp },
    level: "WARNING",
  });

  const lastErrors = await Issue.find({
    timestamp: { $gte: minTimestamp },
    level: "ERROR",
  }).limit(ERRORS_LIMIT);

  const message =
    "Hello devs!\n\n" +
    "Here is a short report from redstone-node-monitoring tool\n" +
    JSON.stringify(
      {
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
      },
      null,
      2
    );

  let subject = "",
    shouldSend = true;
  if (errors > 0) {
    subject = `[ERROR] - (V2) please check ${errors} errors`;
  } else if (warnings > 0) {
    subject = `[WARNING] - (V2) please check ${warnings} warnings`;
  } else {
    shouldSend = false;
  }

  if (shouldSend) {
    logger.info("Sending new email notification");
    const sentReport = await notify(subject, message);
    await new Mail({ timestamp: currentTimestamp }).save();
    logger.info("Email sent: " + JSON.stringify(sentReport));
  } else {
    logger.info("No new notifications to send. Skipping...");
  }
};
