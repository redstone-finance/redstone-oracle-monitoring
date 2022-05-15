const { connectToRemoteMongo } = require("../db-connector");
const Issue = require("../models/issue");

async function main() {
  await connectToRemoteMongo();

  // TODO: analyze
  // - during last 5 minutes
  // - during last hour
  // - during last 24 hours

  // Average, min, max per each data feed
  // Average, min, max per each cache layer
}
