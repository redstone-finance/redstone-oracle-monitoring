const axios = require("axios");
const consola = require("consola");
const redstone = require("redstone-api-extended");

const Notification = require("../models/notification");
const { redstoneApi } = require("../config");

const REDSTONE_TIME_TRACKER_URL = redstoneApi.redstoneTimeTrackerURL;


module.exports = class SourceCheckerJob {
    logger;

    constructor() {
        this.logger = consola.withTag("source-checker-job");
    }

    async execute(configuration) {
        let responseInfo = {
            currentTimestamp: Date.now(),
            url: configuration.url,
            streamrEndpointPrefix: configuration.streamrEndpointPrefix,
        };

        try {
            let info = await this.getData(configuration);
            responseInfo = Object.assign({}, responseInfo, info);

            let errorInfo = await this.verification(configuration, responseInfo);
            responseInfo = Object.assign({}, responseInfo, errorInfo);
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
                this.notificationSaving(responseInfo);
            }
        }
    }

    convertConfigData(configuration) { }

    async getData(configuration) {
        let DataSourceConfig = this.convertConfigData(configuration);
        const dataPackage = await redstone.oracle.get(DataSourceConfig);
        return (dataPackage);
    }

    async verification(configuration, responseInfo) {               //verified
        if (!responseInfo.priceData) {
            responseInfo.level = "ERROR";
            responseInfo.comment = "Empty response";
            responseInfo.type = "fetching-failed";
        } else {
            if (configuration.signature) {
                // TODO: implement EVM lite signature verification here
            }
            // Check timestamp diff

            responseInfo.timestampDiff = responseInfo.currentTimestamp - responseInfo.priceData.timestamp;

            if (responseInfo.timestampDiff > configuration.timestampDelayMillisecondsError) {
                responseInfo.level = "ERROR";
                responseInfo.type = "timestamp-diff";
            } else if (responseInfo.timestampDiff > configuration.timestampDelayMillisecondsWarning) {
                responseInfo.level = "WARNING";
                responseInfo.type = "timestamp-diff";
            }

            // Posting time diff to AWS cloudwatch
            await axios.post(REDSTONE_TIME_TRACKER_URL, {
                label: configuration.label,
                value: responseInfo.timestampDiff,
            });

        }
        return (responseInfo);
    }

    // Saving notifiaction to DB
    async notificationSaving(responseInfo) {
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
