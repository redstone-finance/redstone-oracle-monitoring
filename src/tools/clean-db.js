const { connectToRemoteMongo } = require("../db-connector");
const Issue = require("../models/issue");
const Mail = require("../models/mail");
const Metric = require("../models/metric");

const MAX_COLLECTION_SIZE_TO_CLEAN = 1000000;
const DB_DATA_TTL_HOURS = 24 * 14; // 2 weeks

main();

async function main() {
  const oldTimestampCondition = {
    timestamp: {
      $lte: Date.now() - DB_DATA_TTL_HOURS * 3600 * 1000,
    },
  };
  await tryCleanCollection(Issue, oldTimestampCondition);
  await tryCleanCollection(Metric, oldTimestampCondition);
  await tryCleanCollection(Mail, oldTimestampCondition);
}

async function tryCleanCollection(model, query) {
  await connectToRemoteMongo();
  const collectionSize = await model.countDocuments(query).exec();
  if (collectionSize > MAX_COLLECTION_SIZE_TO_CLEAN) {
    console.warn(
      "Unsafe collection cleaning skipped: " +
        JSON.stringify({ collectionSize, MAX_COLLECTION_SIZE_TO_CLEAN })
    );
  } else {
    console.log(
      `Cleaning collection: ${model.collection.collectionName}. ` +
        `Query: ${JSON.stringify(
          query
        )}. Items to be removed: ${collectionSize}`
    );
    await model.deleteMany(query);
    console.log("Done");
    process.exit();
  }
}
