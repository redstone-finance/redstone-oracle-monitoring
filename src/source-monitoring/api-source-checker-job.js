const axios = require("axios");

const SourceCheckerJob = require("./source-checker-job.js");

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

    async connection(configuration, responseInfo) {
        const response = await axios.get(configuration.url);

        return new Promise((resolve, reject) => {
            responseInfo.url = configuration.url;
            responseInfo.data = response.data;
            responseInfo.timestamp = response.data.timestamp;

            resolve();
        });
    }
}
