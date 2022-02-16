const axios = require("axios");

const consola = require("consola");
const Notification = require("../models/notification");
const redstoneApi = require("../../.secrets/redstoneApi.json");

const REDSTONE_TIME_TRACKER_URL = redstoneApi.redstoneTimeTrackerURL;


module.exports = class SourceCheckerJob {
    logger;

    constructor() {
        this.logger = consola.withTag("source-checker-job");
    }

    async connection(configuration, responseInfo) { }

    async execute(configuration) {
        let responseInfo = {
            level: undefined,
            comment: undefined,
            type: undefined,
            timestampDiff: undefined,
            timestamp: undefined,
            currentTimestamp: Date.now(),
            responseData: undefined,
            url: undefined,
            data: undefined
        };

        try {
            await this.connection(configuration, responseInfo);
            this.verification(configuration, responseInfo);
        }
        catch (e) {
            responseInfo.level = "ERROR";
            responseInfo.type = "fetching-failed";
            if (e.response) {
                responseInfo.comment = JSON.stringify(e.response) + " | " + e.stack;
            } else if (e.toJSON) {
                responseInfo.comment = JSON.stringify(e.toJSON());
            } else {
                responseInfo.comment = String(e);
            }
            this.logger.error("Error occured: " + responseInfo.comment);
        }
        finally {
            if (responseInfo.level) {
                this.saveNotification(responseInfo);
            }
        }
    }

    async verification(configuration, responseInfo) {
        if (!responseInfo.data) {
            responseInfo.level = "ERROR";
            responseInfo.comment = "Empty response";
            responseInfo.type = "fetching-failed";
        } else {
            if (configuration.verifySignature) {
                // TODO: implement EVM lite signature verification here
            }
            // Check timestamp diff
            responseInfo.timestampDiff = responseInfo.currentTimestamp - responseInfo.timestamp;

            if (responseInfo.timestampDiff > configuration.timestampDelayMillisecondsError) {
                responseInfo.level = "ERROR";
                responseInfo.type = "timestamp-diff";
            } else if (this.timestampDiff > configuration.timestampDelayMillisecondsWarning) {
                responseInfo.level = "WARNING";
                responseInfo.type = "timestamp-diff";
            }

            // Posting time diff to AWS cloudwatch
            await axios.post(REDSTONE_TIME_TRACKER_URL, {
                label: configuration.label,
                value: responseInfo.timestampDiff,
            });
        }
    }

    // Saving notifiaction to DB
    async saveNotification(responseInfo) {
        const notificationDetails = {
            timestamp: responseInfo.currentTimestamp,
            type: responseInfo.type,
            level: responseInfo.level,
            url: responseInfo.url,
            comment: responseInfo.comment,
            timestampDiffMilliseconds: responseInfo.timestampDiff,
        };
        this.logger.info("Saving new notification to DB");
        await new Notification(notificationDetails).save();
        this.logger.info("Saved :)");
    }
}
