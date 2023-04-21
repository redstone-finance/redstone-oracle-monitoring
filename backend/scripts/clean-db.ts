import { Model } from "mongoose";
import { connectToRemoteMongo } from "./db-connector";
import { removeOldRecordsForModel } from "./db-cleaner-job";
import { MetricDocument } from "../src/modules/metrics/metrics.schema";
import { IssueDocument } from "../src/modules/issues/issues.schema";

const MAX_COLLECTION_SIZE_TO_CLEAN = 1000000;
const DB_DATA_TTL_DAYS = 14;
const DB_DATA_TTL_TIMESTAMP = 3600 * 1000 * 24 * DB_DATA_TTL_DAYS;

const tryCleanCollection = async (model: any, toTimestamp: number) => {
  await connectToRemoteMongo();
  const collectionSize = await model.countDocuments({
    timestamp: {
      $lte: toTimestamp,
    },
  });
  if (collectionSize > MAX_COLLECTION_SIZE_TO_CLEAN) {
    console.warn(
      "Unsafe collection cleaning skipped: " +
        JSON.stringify({ collectionSize, MAX_COLLECTION_SIZE_TO_CLEAN })
    );
  } else {
    console.log(
      `Cleaning collection: ${model.collection.collectionName}, ` +
        `older than ${DB_DATA_TTL_DAYS} days. Items to be removed: ${collectionSize}`
    );
    await removeOldRecordsForModel(model, toTimestamp);
    console.log("Done");
    process.exit();
  }
};

(async () => {
  const toTimestamp = Date.now() - DB_DATA_TTL_TIMESTAMP;
  const issusModel = Model<IssueDocument>;
  await tryCleanCollection(issusModel, toTimestamp);
  const metricModel = Model<MetricDocument>;
  await tryCleanCollection(metricModel, toTimestamp);
})();
