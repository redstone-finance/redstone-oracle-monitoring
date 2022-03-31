# RedStone Oracle Monitoring
RedStone Oracle Monitoring is an application used to periodically download and validate information on cryptocurrency prices. If an error related to the timestamp or the format of the downloaded data is detected, an appropriate message is recorded in the database.
- [Installation](#installation)
- [Preparation](#Preparation)
- [Running](#running)
- [Configuration](#configuration)
    - [Data sources](#Data-Sources)
- [Tools](#Tools)

## Installation
`yarn`
or
`yarn install`

## Preparation 

`tsc --project tsconfig.json`
or
`yarn build`

## Running

Development version:
`ts-node ./src/run-monitoring-service.js`
or
`yarn start:dev`

Production version:
`node ./dist/run-monitoring-service.js`
or
`yarn start`


## Configuration

### Data Sources
Configuration of source types, addresses, schedules takes place in the file  [`default-data-sources/redstone-avalanche.json`](default-data-sources/redstone-avalanche.json).
We currently use two sources of information: [RedStone-Api](https://redstone.finance/#api) and [Streamr](https://streamr.network/docs/streamr-network/using-a-light-node), which can be clearly seen in the example below:
```json
        {
            "type": "streamr",
            "streamrEndpointPrefix": "0x3a7d971de367fe15d164cdd952f64205f2d9f10c/redstone-oracle",
            "schedule": "*/10 * * * * *",
            "verifySignature": true,
            "label": "avalanche-timestamp-delay-lite-1-all",
            "timestampDelayMillisecondsError": 120000,
            "timestampDelayMillisecondsWarning": 20000
        },
        {
            "type": "cache-layer",
            "url": "https://api.redstone.finance/packages/latest?provider=f1Ipos2fVPbxPVO65GBygkMyW0tkAhp2hdprRPPBBN8&symbol=ETH",
            "schedule": "*/10 * * * * *",
            "verifySignature": true,
            "label": "avalanche-timestamp-delay-full-1-ETH",
            "timestampDelayMillisecondsError": 120000,
            "timestampDelayMillisecondsWarning": 20000
        },
```
The first one configures data download from Streamr `"type": "streamr"`. Then we have the address of the stream from which the data is retrieved `"streamrEndpointPrefix": "0x3a7d971de367fe15d164cdd952f64205f2d9f10c/redstone-oracle"`. 
The second configuration is for the API address `"type": "cache-layer"`. Here, instead of **streamrEndpointPrefix**, we're configuring the url.
The others lines are the same for both types of sources:
- `"schedule"` - time between requests to the source
- `"verifySignature"` - whether the signature of the downloaded data is to be verified
- `"label"` - label identifying the source that will be written to the database when an error is detected
- `"timestampDelayMillisecondsError"` - maximum allowable data obsolescence (written **error** to the database)
- `"timestampDelayMillisecondsWarning"` - as above (written **warning** to the database)


## Tools
In folder [`./src/tools`](src/tools) are defined some interesting programs and scripts:
- [`monitoring-service-configuration.js`](#src/tools/monitoring-service-configuration.js) - script for generating a sample sources file
