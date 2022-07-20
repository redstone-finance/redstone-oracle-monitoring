import consola from "consola";
import { generateIssuesAnalysis } from "../tools/generate-issues-analysis";
import { Issue } from "../models/issue";
import { Mail } from "../models/mail";
import { notify as notifyByEmail } from "../notifiers/email-notifier-mailgun";
import { notify as notifyByTelegram } from "../notifiers/telegram-notifier";

const MIN_WARNING_MAIL_INTERVAL = 3 * 3600 * 1000; // 3 hours
const MIN_ERROR_MAIL_INTERVAL = 1800 * 1000; // 0.5 hour
const ERRORS_LIMIT = 5;

const logger = consola.withTag("email-notifier-job");

// Counts warnings and errors for the last period of time
export const execute = async () => {
  const currentTimestamp = Date.now();
  const minWarningTimestamp = currentTimestamp - MIN_WARNING_MAIL_INTERVAL;
  const minErrorTimestamp = currentTimestamp - MIN_ERROR_MAIL_INTERVAL;

  const lastWarningSentMailCount = await Mail.countDocuments({
    timestamp: { $gte: minWarningTimestamp },
  }).exec();

  const lastErrorSentMailCount = await Mail.countDocuments({
    timestamp: { $gte: minErrorTimestamp },
  }).exec();

  if (lastErrorSentMailCount === 0) {
    handleErrorMessage(minErrorTimestamp, currentTimestamp);
  }

  if (lastWarningSentMailCount === 0) {
    handleWarningMessage(minWarningTimestamp, currentTimestamp);
  }
};

const handleErrorMessage = async (
  minErrorTimestamp: number,
  currentTimestamp: number
) => {
  const errorsCount = await Issue.countDocuments({
    timestamp: { $gte: minErrorTimestamp },
    level: "ERROR",
  });

  const lastErrors = await Issue.find({
    timestamp: { $gte: minErrorTimestamp },
    level: "ERROR",
  }).limit(ERRORS_LIMIT);

  const issuesAnalysis = await generateIssuesAnalysis(
    minErrorTimestamp,
    currentTimestamp
  );

  const message = generateErrorMessage(
    errorsCount,
    minErrorTimestamp,
    currentTimestamp,
    lastErrors,
    issuesAnalysis
  );

  if (errorsCount > 0) {
    await sendEmailNotification(
      message,
      currentTimestamp,
      errorsCount,
      "errors"
    );
    await sendTelegramNotification(errorsCount, "errors");
  } else {
    logger.info("No new notifications to send. Skipping...");
  }
};

const handleWarningMessage = async (
  minWarningTimestamp: number,
  currentTimestamp: number
) => {
  const warningsCount = await Issue.countDocuments({
    timestamp: { $gte: minWarningTimestamp },
    level: "WARNING",
  });

  const message = generateWarningMessage(
    warningsCount,
    minWarningTimestamp,
    currentTimestamp
  );
  if (warningsCount > 0) {
    await sendEmailNotification(
      message,
      currentTimestamp,
      warningsCount,
      "warnings"
    );
    await sendTelegramNotification(warningsCount, "warnings");
  } else {
    logger.info("No new notifications to send. Skipping...");
  }
};

const generateErrorMessage = (
  errorsCount: number,
  minTimestamp: number,
  currentTimestamp: number,
  lastErrors: Issue[],
  issuesAnalysis: Awaited<ReturnType<typeof generateIssuesAnalysis>>
) => {
  return (
    "Hello devs!\n\n" +
    "Here is a short report from redstone-node-monitoring tool\n" +
    JSON.stringify(
      {
        errors: errorsCount,
        mongoQueryForErrors: {
          timestamp: { $gte: minTimestamp, $lte: currentTimestamp },
          level: "ERROR",
        },
        lastErrors,
        issuesAnalysis,
      },
      null,
      2
    )
  );
};

const generateWarningMessage = (
  warningsCount: number,
  minTimestamp: number,
  currentTimestamp: number
) => {
  return (
    "Hello devs!\n\n" +
    "Here is a short report from redstone-node-monitoring tool\n" +
    JSON.stringify(
      {
        warnings: warningsCount,
        mongoQueryForWarnings: {
          timestamp: { $gte: minTimestamp, $lte: currentTimestamp },
          level: "WARNING",
        },
      },
      null,
      2
    )
  );
};

const sendEmailNotification = async (
  message: string,
  currentTimestamp: number,
  issueCount: number,
  issueType: "warnings" | "errors"
) => {
  const subject = `[RedStone node monitoring] - please check ${issueCount} ${issueType}`;
  logger.info("Sending new email notification");
  const sentEmailReport = await notifyByEmail(subject, message);
  await new Mail({ timestamp: currentTimestamp }).save();
  logger.info("Email sent: " + JSON.stringify(sentEmailReport));
};

const sendTelegramNotification = async (
  issueCount: number,
  issueType: "warnings" | "errors"
) => {
  logger.info("Sending new telegram notification");
  const telegramMessage = `${capitalizeFirstLetter(issueType)}: ${issueCount}`;
  await notifyByTelegram(telegramMessage);
  logger.info("Telegram message sent: " + JSON.stringify(telegramMessage));
};

const capitalizeFirstLetter = (stringToCapitalize: string) => {
  return (
    stringToCapitalize.charAt(0).toUpperCase() + stringToCapitalize.slice(1)
  );
};
