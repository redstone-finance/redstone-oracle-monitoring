import {
    DataSourcesConfig,
    SignedPriceDataType,
} from "redstone-api-extended/lib/oracle/redstone-data-feed";

export enum ExceptionLevel {
    ERROR = "ERROR",
    WARNING = "WARNING"
}
export enum ExceptionType {
    timestampDiff = "timestamp-diff",
    invalidSignature = "invalid-signature",
    fetchingFailed = "fetching-failed"
}

export interface ReceivedDataDetails {
    timestamp: number,
    level: ExceptionLevel,
    signedPriceDataType?: SignedPriceDataType
}

export interface NotificationDetails {
    timestamp: number,
    type: ExceptionType,
    level: ExceptionLevel,
    url: string,
    comment?: string,
    timestampDiffMilliseconds?: number
}

export class TimestampError extends Error {
    constructor(m: string) {
        super(m);
    }

    sayHello() {
        return "hello " + this.message;
    }
}

export class SignatureError extends Error {
    constructor(m: string) {
        super(m);
    }

    sayHello() {
        return "hello " + this.message;
    }
}
