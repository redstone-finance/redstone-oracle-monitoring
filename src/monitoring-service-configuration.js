const API_URLS = {
  "full-1": "https://api.redstone.finance",
  "lite-1": "https://vwx3eni8c7.eu-west-1.awsapprunner.com",
  "lite-2": "https://container-service-1.dv9sai71f4rsq.eu-central-1.cs.amazonlightsail.com"
}

const SYMBOLS = [
  "ETH",
  "AVAX",
  "QI",
];

const config = {
  sources: [
    avalancheSourceChecker(API_URLS["full-1"], undefined, "full-1-all"),
    avalancheSourceChecker(API_URLS["lite-1"], undefined, "lite-1-all"),
    avalancheSourceChecker(API_URLS["lite-2"], undefined, "lite-2-all"),

    ...SYMBOLS.map(symbol => avalancheSourceChecker(API_URLS["full-1"], symbol, `full-1-${symbol}`)),
    ...SYMBOLS.map(symbol => avalancheSourceChecker(API_URLS["lite-1"], symbol, `full-1-${symbol}`)),
    ...SYMBOLS.map(symbol => avalancheSourceChecker(API_URLS["lite-2"], symbol, `full-1-${symbol}`)),
  ],

  notifiers: {
    "AWS-SNS": {
      interval: 5 * 60 * 1000, // 5 minutes
      levels: ["WARNING", "ERROR"],
    },
  },
};

function avalancheSourceChecker(baseUrl, symbol, labelPostfix) {
  const url = `${baseUrl}/packages/latest?provider=f1Ipos2fVPbxPVO65GBygkMyW0tkAhp2hdprRPPBBN8`
    + (symbol ? `&symbol=${symbol}` : '');
  return {
    url,
    schedule: "*/10 * * * * *", // every 10 seconds
    verifySignature: true,
    label: 'avalanche-timestamp-delay-' + labelPostfix,
    timestampDelayMillisecondsError: 2 * 60 * 1000, // 2 mins
    timestampDelayMillisecondsWarning: 20 * 1000, // 20 seconds
  };
}

module.exports = config;
