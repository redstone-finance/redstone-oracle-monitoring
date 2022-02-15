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

    async connection(configuration) { }

    async execute(configuration) {
        this.currentTimestamp = Date.now();
        this.level = this.comment = this.type = this.timestampDiff = this.url = undefined;

        try {
            let responseData = await this.connection(configuration);
            this.verification(configuration, responseData);
        }
        catch (e) {
            this.level = "ERROR";
            this.type = "fetching-failed";
            if (e.response) {
                this.comment = JSON.stringify(e.response) + " | " + e.stack;
            } else if (e.toJSON) {
                this.comment = JSON.stringify(e.toJSON());
            } else {
                this.comment = String(e);
            }
            this.logger.error("Error occured: " + this.comment);
        }
        finally {
            if (this.level) {
                this.saveNotification();
            }
        }
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
