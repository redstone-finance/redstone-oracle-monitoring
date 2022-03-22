const StreamrClient = require('streamr-client');

const SourceCheckerJob = require("./CheckerJob.js")


// Example configuration below
// {
//    "type": "streamr-storage",
//    "streamrEndpointPrefix": "0x3a7d971de367fe15d164cdd952f64205f2d9f10c/redstone-oracle",
//    "schedule": "*/10 * * * * *",
//    "verifySignature": true,
//    "label": "avalanche-timestamp-delay-lite-1-all",
//    "timestampDelayMillisecondsError": 120000,
//    "timestampDelayMillisecondsWarning": 20000
// }

module.exports = class SourceCheckerJobStreamr extends SourceCheckerJob {

    convertConfigData(configuration) {
        return (
            {
                "sources": [
                    {
                        "type": configuration.type,
                        "streamrEndpointPrefix": configuration.streamrEndpointPrefix,
                        "disabledForSinglePrices": false,
                        "evmSignerAddress": ""
                    }
                ],
                "valueSelectionAlgorithm": "first-valid",
                "timeoutMilliseconds": 10000,
                "maxTimestampDiffMilliseconds": configuration.timestampDelayMillisecondsError,
                "preVerifySignatureOffchain": false
            });
    }
}
