const axios = require("axios");

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

    constructor() {
        super();
    }

    async request(configuration) {
        const response = await axios.get(configuration.url);

        return ({
            url: configuration.url,
            data: response.data,
            timestamp: response.data.timestamp,
        });
    }
}
