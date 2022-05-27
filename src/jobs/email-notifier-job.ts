import consola from "consola";
import { Issue } from "../models/issue";
import { Mail } from "../models/mail";
import { notify } from "../notifiers/email-notifier-mailgun";
import { generateIssueAnalysis } from "../tools/analyze-issue";

const MIN_MAIL_INTERVAL = 3 * 3600 * 1000; // 3 hours
const ERRORS_LIMIT = 5;

const logger = consola.withTag("email-notifier-job");

// Counts warnings and errors for the last period of time
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

  const issuesAnalysis = await generateIssueAnalysis(
    minTimestamp,
    currentTimestamp
  );

  const message =
    "Hello devs!\n\n" +
    "Here is a short report from redstone-node-monitoring tool\n" +
    JSON.stringify(
      {
        errors,
        warnings,
        lastErrors,
        issuesAnalysis,
      },
      null,
      2
    );

  let subject = "",
    shouldSend = true;
  if (errors > 0) {
    subject = `[RedStone node monitoring] - please check ${errors} errors`;
  } else if (warnings > 0) {
    subject =
      errors > 0
        ? `${subject} and ${warnings} warnings`
        : `[RedStone node monitoring] - please check ${warnings} warnings`;
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
