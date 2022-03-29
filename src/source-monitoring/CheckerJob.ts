import consola, { Consola } from "consola";
import redstone from "redstone-api-extended";

import Notification from "../models/notification";
import { redstoneApi } from "../config";

import { DataSourcesConfig, SignedPriceDataType } from "redstone-api-extended/lib/oracle/redstone-data-feed";
import { ReceivedDataDetails, NotificationDetails, ExceptionLevel } from "../types";


const REDSTONE_TIME_TRACKER_URL = redstoneApi.redstoneTimeTrackerURL;


export abstract class CheckerJob {
    protected logger: Consola;

    constructor(protected config: DataSourcesConfig, protected exceptionLevel: ExceptionLevel) {
        this.logger = consola.withTag("source-checker-job");
    }

    async execute() {

        const receivedDataDetails: ReceivedDataDetails = {
            timestamp: Date.now(),
            level: this.exceptionLevel
        }

        try {
            receivedDataDetails.signedPriceDataType = await this.getData();
        }
        catch (e) {
            var notificationDetails: NotificationDetails = this.prepareNotification(e, receivedDataDetails);
            this.notificationSaving(notificationDetails);
        }
    }

    async getData(): Promise<SignedPriceDataType> {
        var data = await redstone.oracle.get(this.config);
        return data;
    }

    abstract prepareNotification(error: Error, receivedDataDetails: ReceivedDataDetails): NotificationDetails;


    // Saving notifiaction to DB
    async notificationSaving(notificationDetails: NotificationDetails) {
        this.logger.info("Saving new notification to DB");
        await new Notification(notificationDetails).save();
        this.logger.info("Saved :)");
    }
}
