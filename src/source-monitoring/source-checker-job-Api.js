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

    async execute(configuration) {
        super.execute(configuration);

        let responseData;

        try {
            this.url = configuration.url;
            const response = await axios.get(this.url);
            responseData = {
                data: response.data,
                timestamp: response.data.timestamp
            };
        }
        catch (e) {
            this.level = "ERROR";
            this.type = "fetching-failed";
            if (e.response) {
                this.comment = JSON.stringify(e.response.data) + " | " + e.stack;
            } else if (e.toJSON) {
                this.comment = JSON.stringify(e.toJSON());
            } else {
                this.comment = String(e);
            }
            this.logger.error("Error occured: " + this.comment);
        }

        super.verification(configuration, responseData);
    }
}