import { connectToRemoteMongo } from "../helpers/db-connector";

const main = async () => {
  await connectToRemoteMongo();

  // TODO: analyze
  // - during last 5 minutes
  // - during last hour
  // - during last 24 hours
};
