import { CheckerJob } from "./CheckerJob"
import { ReceivedDataDetails, NotificationDetails, ExceptionType, TimestampError, SignatureError } from "../types";
import InvalidSignatureError from "redstone-api-extended/lib/errors/invalid-signature";
import TooOldTimestampError from "redstone-api-extended/lib/errors/too-old-timestamp";

export class SingleSourceCheckerJob extends CheckerJob {

    prepareNotification(error: Error, receivedDataDetails: ReceivedDataDetails): NotificationDetails {
        var type: ExceptionType;

        // We receive errors in Array (instanceof AggregateError from bluebird library) but
        // because it is CheckerJob for single source, so we are sure that it's length is 1
        var e = error[0];

        if (e.name === 'TooOldTimestampError') {
            type = ExceptionType.timestampDiff;
        } else if (e.name === 'InvalidSignatureError') {
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
            timestampDiffMilliseconds: receivedDataDetails.signedPriceDataType ? receivedDataDetails.timestamp - receivedDataDetails.signedPriceDataType.priceData.timestamp : undefined
        };
        return notificationDetails;
    }

}
