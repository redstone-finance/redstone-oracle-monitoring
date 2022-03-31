import { DataSourcesConfig } from "redstone-api-extended/lib/oracle/redstone-data-feed";

import { CheckerJob } from "./CheckerJob"
import { ReceivedDataDetails, NotificationDetails, ExceptionType, ExceptionLevel, TimestampError, SignatureError } from "../types";
import InvalidSignatureError from "redstone-api-extended/lib/errors/invalid-signature";
import TooOldTimestampError from "redstone-api-extended/lib/errors/too-old-timestamp";

export class DataFeedCheckerJob extends CheckerJob {
    constructor(config: DataSourcesConfig, exceptionLevel: ExceptionLevel, protected dataFeedId: string) {
        super(config, exceptionLevel);
    }

    prepareNotification(error: Error, receivedDataDetails: ReceivedDataDetails): NotificationDetails {
        var type: ExceptionType;

        if (error.name === 'TooOldTimestampError') {
            type = ExceptionType.timestampDiff;
        } else if (error.name === 'InvalidSignatureError') {
            type = ExceptionType.invalidSignature;
        } else {
            type = ExceptionType.fetchingFailed;
        }

        const notificationDetails: NotificationDetails = {
            timestamp: receivedDataDetails.timestamp,
            type: type,
            level: receivedDataDetails.level,
            url: this.dataFeedId,
            comment: error.message,
            timestampDiffMilliseconds: receivedDataDetails.signedPriceDataType ? receivedDataDetails.timestamp - receivedDataDetails.signedPriceDataType.priceData.timestamp : undefined
        };
        return notificationDetails;
    }

}