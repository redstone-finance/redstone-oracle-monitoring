import consola from "consola";
import { generateIssueAnalysis } from "../helpers/aggregate-issues";
import { Issue } from "../models/issue";
import { Mail } from "../models/mail";
import { notify as notifyByEmail } from "../notifiers/email-notifier-mailgun";
import { notify as notifyByTelegram } from "../notifiers/telegram-notifier";

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

  const errorsCount = await Issue.countDocuments({
    timestamp: { $gte: minTimestamp },
    level: "ERROR",
  });

  const warningsCount = await Issue.countDocuments({
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
        errors: errorsCount,
        warnings: warningsCount,
        mongoQueryForErrors: {
          timestamp: { $gte: minTimestamp, $lte: currentTimestamp },
          level: "ERROR",
        },
        mongoQueryForWarnings: {
          timestamp: { $gte: minTimestamp, $lte: currentTimestamp },
          level: "WARNING",
        },
        lastErrors,
        issuesAnalysis,
      },
      null,
      2
    );

  const shouldNotify = errorsCount > 0 || warningsCount > 0;
  if (shouldNotify) {
    await sendEmailNotification(
      errorsCount,
      warningsCount,
      message,
      currentTimestamp
    );
    await sendTelegramNotification(errorsCount, warningsCount);
  } else {
    logger.info("No new notifications to send. Skipping...");
  }
};

const getEmailSubject = (errorsCount: number, warningsCount: number) => {
  let subject = "";
  if (errorsCount > 0) {
    subject = `[RedStone node monitoring] - please check ${errorsCount} errors`;
  } else if (warningsCount > 0) {
    subject =
      errorsCount > 0
        ? `${subject} and ${warningsCount} warnings`
        : `[RedStone node monitoring] - please check ${warningsCount} warnings`;
  }
  return subject;
};

const sendEmailNotification = async (
  errorsCount: number,
  warningsCount: number,
  message: string,
  currentTimestamp: number
) => {
  const subject = getEmailSubject(errorsCount, warningsCount);
  logger.info("Sending new email notification");
  const sentEmailReport = await notifyByEmail(subject, message);
  await new Mail({ timestamp: currentTimestamp }).save();
  logger.info("Email sent: " + JSON.stringify(sentEmailReport));
};

const sendTelegramNotification = async (
  errorsCount: number,
  warningsCount: number
) => {
  logger.info("Sending new email notification");
  const telegramMessage = `Errors: ${errorsCount}, Warnings: ${warningsCount}`;
  await notifyByTelegram(telegramMessage);
  logger.info("Telegram message sent: " + JSON.stringify(telegramMessage));
};
