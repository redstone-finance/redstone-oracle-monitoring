const axios = require("axios");
const { URL } = require('url');

const SourceCheckerJob = require("./CheckerJob.js");

// Example configuration below
// {
//   url: "https://api.redstone.finance/packages/latest?provider=redstone-avalanche",
//   schedule: "/10 * * * * *", // every 10 seconds
//   verifySignature: true,
//   label:  'avalanche-timestamp-delay-all',
//   timestampDelayMillisecondsError: 3 * 60 * 1000, // 3 mins
//   timestampDelayMillisecondsWarning: 60 * 1000, // 1 minute
// }

module.exports = class SourceCheckerJobApi extends SourceCheckerJob {

    convertConfigData(configuration) {
        // parse url
        const urlObject = new URL(configuration.url);

        const domain_address = urlObject.protocol + "//" + urlObject.hostname;
        const providerId = urlObject.searchParams.get('provider');

        // convert configuration to redston-api format
        return (
            {
                "sources": [
                    {
                        "type": configuration.type,
                        "url": domain_address,
                        "providerId": providerId,
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
