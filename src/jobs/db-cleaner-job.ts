import consola from "consola";
import {
  connectToRemoteMongo,
  disconnectFromRemoteMongo,
} from "../helpers/db-connector";
import { dbTtlInDays } from "../config";
import { Metric } from "../models/metric";
import { Issue } from "../models/issue";
import { Mail } from "../models/mail";

const ONE_DAY_IN_MILLISECONDS = 3600 * 1000 * 24;

export const execute = async () => {
  const logger = consola.withTag(`db-cleaner`);
  await connectToRemoteMongo();
  logger.info(`Cleaning records older than ${dbTtlInDays} from db`);
  const currentTimestamp = Date.now();
  const ttlAsNumber = Number(dbTtlInDays);
  const toTimestamp = currentTimestamp - ttlAsNumber * ONE_DAY_IN_MILLISECONDS;
  const { removedMetricsCount, removedIssuesCount, removedMailsCount } =
    await removeRecordsOfEachModel(toTimestamp);
  logger.info(
    `Removed: ${removedMetricsCount} metrics, ${removedIssuesCount} issues, ${removedMailsCount} mails`
  );
  await disconnectFromRemoteMongo();
};

const removeRecordsOfEachModel = async (toTimestamp: number) => {
  const removedMetricsResult = await Metric.deleteMany({
    timestamp: {
      $lte: toTimestamp,
    },
  });
  const removedIssuesResult = await Issue.deleteMany({
    timestamp: {
      $lte: toTimestamp,
    },
  });
  const removedMailsResult = await Mail.deleteMany({
    timestamp: {
      $lte: toTimestamp,
    },
  });

  return {
    removedMetricsCount: removedMetricsResult.deletedCount,
    removedIssuesCount: removedIssuesResult.deletedCount,
    removedMailsCount: removedMailsResult.deletedCount,
  };
};
