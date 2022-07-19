import { Model } from "mongoose";
import { Issue } from "src/modules/issues/issues.model";
import { Mail } from "src/modules/mail/mail.model";
import { Metric } from "src/modules/metrics/metrics.model";
import { connectToRemoteMongo } from "src/shared/db-connector";
import { removeOldRecordsForModel } from "../src/modules/jobs/db-cleaner-job";

const MAX_COLLECTION_SIZE_TO_CLEAN = 1000000;
const DB_DATA_TTL_DAYS = 14;
const DB_DATA_TTL_TIMESTAMP = 3600 * 1000 * 24 * DB_DATA_TTL_DAYS;

(async () => {
  const toTimestamp = Date.now() - DB_DATA_TTL_TIMESTAMP;
  await tryCleanCollection(Issue, toTimestamp);
  await tryCleanCollection(Metric, toTimestamp);
  await tryCleanCollection(Mail, toTimestamp);
})();

const tryCleanCollection = async (model: Model<any>, toTimestamp: number) => {
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
