import { DataSourcesConfig } from "redstone-api-extended/lib/oracle/redstone-data-feed";

import { CheckerJob } from "./CheckerJob"
import { ReceivedDataDetails, NotificationDetails, ExceptionType, ExceptionLevel } from "../types";


export class DataFeedCheckerJob extends CheckerJob {
    constructor(protected config: DataSourcesConfig, protected exceptionLevel: ExceptionLevel, protected dataFeedId: string) {
        super(config, exceptionLevel);
    }

    prepareNotification(error: Error, receivedDataDetails: ReceivedDataDetails): NotificationDetails {
        var type: ExceptionType;

        if (error instanceof TimestampError) {
            type = ExceptionType.timestampDiff;
        } else if (error instanceof SignatureError) {
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
            timestampDiffMilliseconds: receivedDataDetails.timestamp - receivedDataDetails.signedPriceDataType.priceData.timestamp
        };
        return notificationDetails;
    }

}
