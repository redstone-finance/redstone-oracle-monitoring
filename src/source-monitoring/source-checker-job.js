const axios = require("axios");
const consola = require("consola");

const redstoneApi = require("../../.secrets/redstoneApi.json");
const Notification = require("../models/notification");

const REDSTONE_TIME_TRACKER_URL = redstoneApi.redstoneTimeTrackerURL;

// Example configuration below
// {
//   url: "https://api.redstone.finance/packages/latest?provider=redstone-avalanche",
//   schedule: "/10 * * * * *", // every 10 seconds
//   verifySignature: true,
//   label:  'avalanche-timestamp-delay-all',
//   timestampDelayMillisecondsError: 3 * 60 * 1000, // 3 mins
//   timestampDelayMillisecondsWarning: 60 * 1000, // 1 minute
// }

const logger = consola.withTag("source-checker-job");

async function execute(configuration) {
  let comment, level, type, timestampDiff;

  const currentTimestamp = Date.now();

  try {
    const response = await axios.get(configuration.url);

    if (!response.data) {
      level = "ERROR";
      comment = "Empty response";
      type = "fetching-failed";
    } else {
      if (configuration.verifySignature) {
        // TODO: implement EVM lite signature verification here
      }

      // Check timestamp diff
      timestampDiff = currentTimestamp - response.data.timestamp;

      if (timestampDiff > configuration.timestampDelayMillisecondsError) {
        level = "ERROR";
        type = "timestamp-diff";
      } else if (timestampDiff > configuration.timestampDelayMillisecondsWarning) {
        level = "WARNING";
        type = "timestamp-diff";
      }

      // Posting time diff to AWS cloudwatch
      await axios.post(REDSTONE_TIME_TRACKER_URL, {
        label: configuration.label,
        value: timestampDiff,
      });
    }
  } catch (e) {
    level = "ERROR";
    type = "fetching-failed";
    if (e.response) {
      comment = JSON.stringify(e.response.data) + " | " + e.stack;
    } else if (e.toJSON) {
      comment = JSON.stringify(e.toJSON());
    } else {
      comment = String(e);
    }
    logger.error("Error occured: " + comment);
  }

  // Saving notifiaction to DB if needed
  if (level) {
    const notificationDetails = {
      timestamp: currentTimestamp,
      type,
      level,
      url: configuration.url,
      comment,
      timestampDiffMilliseconds: timestampDiff,
    };
    logger.info("Saving new notification to DB");
    await new Notification(notificationDetails).save();
    logger.info("Saved :)");
  }
}

module.exports = {
  execute,
};
