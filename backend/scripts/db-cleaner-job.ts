import { Model } from "mongoose";
import { Logger } from "@nestjs/common";
import { MetricDocument } from "../src/modules/metrics/metrics.schema";
import { IssueDocument } from "../src/modules/issues/issues.schema";

const ONE_DAY_IN_MILLISECONDS = 3600 * 1000 * 24;
const DB_RRL_IN_DAYS = 14;

export const execute = async () => {
  Logger.log(`Cleaning records older than ${DB_RRL_IN_DAYS} from db`);
  const currentTimestamp = Date.now();
  const toTimestamp =
    currentTimestamp - DB_RRL_IN_DAYS * ONE_DAY_IN_MILLISECONDS;
  const removedCount = await removeRecordsOfEachModel(toTimestamp);
  const { metrics, issues, mails } = removedCount;
  Logger.log(`Removed: ${metrics} metrics, ${issues} issues, ${mails} mails`);
};

const removeRecordsOfEachModel = async (toTimestamp: number) => {
  const removedModelsCount = {
    metrics: 0,
    issues: 0,
    mails: 0,
  };

  const issusModel = Model<IssueDocument>;
  const documentModel = Model<MetricDocument>;
  const models = [issusModel, documentModel];
  for (const model of models) {
    const removedCount = await removeOldRecordsForModel(model, toTimestamp);
    removedModelsCount[
      model.collection.collectionName as keyof typeof removedModelsCount
    ] = removedCount;
  }
  return removedModelsCount;
};

export const removeOldRecordsForModel = async (
  model: any,
  toTimestamp: number
) => {
  const deleteResult = await model.deleteMany({
    timestamp: {
      $lte: toTimestamp,
    },
  });
  return deleteResult.deletedCount;
};
