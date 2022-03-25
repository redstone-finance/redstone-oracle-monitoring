import { CheckerJob } from "./CheckerJob"
import { ReceivedDataDetails, NotificationDetails, ExceptionType } from "../types";

export class SingleSourceCheckerJob extends CheckerJob {

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
            url: this.config.sources[0].url ? this.config.sources[0].url : this.config.sources[0].streamrEndpointPrefix,
            comment: error.message,
            timestampDiffMilliseconds: receivedDataDetails.timestamp - receivedDataDetails.signedPriceDataType.priceData.timestamp
        };
        return notificationDetails;
    }

}
