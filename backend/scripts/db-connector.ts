import mongoose from "mongoose";
import { Logger } from "@nestjs/common";

const MONGO_DB_URL =
  "mongodb://mongodb:27017/redstone-oracle-monitoring?retryWrites=true&w=majority";

export const connectToRemoteMongo = async () => {
  if (!!MONGO_DB_URL) {
    await mongoose.connect(MONGO_DB_URL);
    subscribeMonitoringExit();
    Logger.log("Connected to MongoDB");
  } else {
    Logger.error("Empty MongoDB URL");
  }
};

const subscribeMonitoringExit = () => {
  process.on("beforeExit", async () => {
    await disconnectFromRemoteMongo();
  });

  process.on("SIGINT", async () => {
    await disconnectFromRemoteMongo();
    process.exit(0);
  });

  process.on("uncaughtException", async (error) => {
    await disconnectFromRemoteMongo();
    Logger.error("Uncaught Exception:");
    Logger.error(error.stack);
    process.exit(1);
  });
};

export const disconnectFromRemoteMongo = async () => {
  await mongoose.disconnect();
  Logger.log("Disconnected from MongoDB");
};
