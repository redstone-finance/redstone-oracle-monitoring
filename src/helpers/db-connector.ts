import mongoose from "mongoose";
import { mongoDbUrl } from "../config";

export const connectToRemoteMongo = async () => {
  await mongoose.connect(mongoDbUrl);
  console.log("Connected to MongoDB");
};
