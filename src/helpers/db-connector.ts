import mongoose from "mongoose";
import consola from "consola";
import { mongoDbUrl } from "../config";

const logger = consola.withTag("run-monitoring-service");

export const connectToRemoteMongo = async () => {
  await mongoose.connect(mongoDbUrl);
  subscribeMonitoringExit();
  logger.log("Connected to MongoDB");
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
    logger.error("Uncaught Exception:");
    logger.error(error.stack);
    process.exit(1);
  });
};

export const disconnectFromRemoteMongo = async () => {
  await mongoose.disconnect();
  logger.log("Disconnected from MongoDB");
};
