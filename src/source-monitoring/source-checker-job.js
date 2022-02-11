const axios = require("axios");

const consola = require("consola");
const Notification = require("../models/notification");
const redstoneApi = require("../../.secrets/redstoneApi.json");

const REDSTONE_TIME_TRACKER_URL = redstoneApi.redstoneTimeTrackerURL;


module.exports = class SourceCheckerJob {
    #logger;

    #comment;
    #level;
    #type;
    #timestampDiff;
    #url;

    #currentTimestamp;

    constructor() {
        this.logger = consola.withTag("source-checker-job");
    }

    async execute(configuration) {
        this.currentTimestamp = Date.now();
        this.level = this.comment = this.type = this.timestampDiff = this.url = undefined;

    }

    async verification(configuration, responseData) {
        if (!responseData.data) {
            this.level = "ERROR";
            this.comment = "Empty response";
            this.type = "fetching-failed";
        } else {
            if (configuration.verifySignature) {
                // TODO: implement EVM lite signature verification here
            }
            // Check timestamp diff
            this.timestampDiff = this.currentTimestamp - responseData.timestamp;

            if (this.timestampDiff > configuration.timestampDelayMillisecondsError) {
                this.level = "ERROR";
                this.type = "timestamp-diff";
            } else if (this.timestampDiff > configuration.timestampDelayMillisecondsWarning) {
                this.level = "WARNING";
                this.type = "timestamp-diff";
            }

            // Posting time diff to AWS cloudwatch
            await axios.post(REDSTONE_TIME_TRACKER_URL, {
                label: configuration.label,
                value: this.timestampDiff,
            });
        }

        if (this.level) {
            this.saveNotification();
        }
    }

    // Saving notifiaction to DB
    async saveNotification() {
        const notificationDetails = {
            timestamp: this.currentTimestamp,
            type: this.type,
            level: this.level,
            url: this.url,
            comment: this.comment,
            timestampDiffMilliseconds: this.timestampDiff,
        };
        this.logger.info("Saving new notification to DB");
        await new Notification(notificationDetails).save();
        this.logger.info("Saved :)");
    }
}