import { Model } from "mongoose";
import consola from "consola";
import { dbTtlInDays } from "../config";
import { Metric } from "../models/metric";
import { Issue } from "../models/issue";
import { Mail } from "../models/mail";

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

export const removeOldRecordsForModel = async <T>(
  model: Model<T>,
  toTimestamp: number
) => {
  const deleteResult = await model.deleteMany({
    timestamp: {
      $lte: toTimestamp,
    },
  });
  return deleteResult.deletedCount;
};
