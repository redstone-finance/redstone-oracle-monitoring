import { Model } from "mongoose";
import consola from "consola";
import { dbTtlInDays } from "src/config";
import { Issue } from "../issues/issues.model";
import { Mail } from "../mail/mail.model";
import { Metric } from "../metrics/metrics.model";
import { Metric as MetricType } from "../../../../shared/types";

const ONE_DAY_IN_MILLISECONDS = 3600 * 1000 * 24;

export const execute = async () => {
  const logger = consola.withTag(`db-cleaner`);
  logger.info(`Cleaning records older than ${dbTtlInDays} from db`);
  const currentTimestamp = Date.now();
  const toTimestamp = currentTimestamp - dbTtlInDays * ONE_DAY_IN_MILLISECONDS;
  const removedCount = await removeRecordsOfEachModel(toTimestamp);
  const { metrics, issues, mails } = removedCount;
  logger.info(`Removed: ${metrics} metrics, ${issues} issues, ${mails} mails`);
};

const removeRecordsOfEachModel = async (toTimestamp: number) => {
  const removedModelsCount = {
    metrics: 0,
    issues: 0,
    mails: 0,
  };
  for (const model of [Metric, Issue, Mail]) {
    const removedCount = await removeOldRecordsForModel(model, toTimestamp);
    removedModelsCount[model.collection.collectionName] = removedCount;
  }
  return removedModelsCount;
};

export const removeOldRecordsForModel = async (
  model: Model<MetricType | Issue | Mail>,
  toTimestamp: number
) => {
  const deleteResult = await model.deleteMany({
    timestamp: {
      $lte: toTimestamp,
    },
  });
  return deleteResult.deletedCount;
};
