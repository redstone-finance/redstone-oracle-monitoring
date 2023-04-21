import { Injectable, Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { exec } from "child_process";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { HttpService } from "@nestjs/axios";
import { CronJob } from "cron";
import { DataPackagesResponse, requestDataPackages } from "redstone-sdk";
import { dataServicesToCheck } from "../../config";
import { stringifyError } from "../../shared/error-stringifier";
import { Issue, IssueDocument } from "../issues/issues.schema";
import { Metric, MetricDocument } from "../metrics/metrics.schema";

interface DataServiceConfig {
  id: string;
  checkWithoutSymbol: boolean;
  dataFeedsToCheck: string[];
  checkEachSingleUrl: boolean;
  minTimestampDiffForWarning: number;
  schedule: string;
  urls: string[];
  uniqueSignersCount: number;
  dataFeedsToCheckDeviation: {
    [dataFeed in string]: DataFeedToCheckDeviationDetails;
  };
}

interface CheckDataServiceInput {
  dataServiceId: string;
  dataFeedId: string;
  urls?: string[];
  uniqueSignersCount: number;
}

interface CheckSingleSourceInput {
  dataServiceId: string;
  minTimestampDiffForWarning: number;
  url: string;
  dataFeeds: string[];
  uniqueSignersCount: number;
}

interface CheckIfValidNumberOfSignaturesInput {
  dataFeedId: string;
  dataServiceId: string;
  dataPackageResponse: DataPackagesResponse;
  uniqueSignersCount: number;
  timestamp: number;
  url: string;
}

interface SaveMetricInput {
  metricName: string;
  timestampDiff: number;
  timestamp: number;
  dataServiceId: string;
  url: string;
}

interface SaveErrorInput {
  timestamp: number;
  dataServiceId: string;
  url: string;
  type: string;
  comment: string;
}

interface DataFeedToCheckDeviationDetails {
  timePeriodInMilliseconds: number;
  deviationLimitToNotify: number;
}

@Injectable()
export class CronService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    @InjectModel(Issue.name) private issueModel: Model<IssueDocument>,
    @InjectModel(Metric.name) private metricModel: Model<MetricDocument>,
    private readonly httpService: HttpService,
    private configService: ConfigService
  ) {}

  addCronJobs() {
    for (const dataService of dataServicesToCheck) {
      // if (dataService.checkWithoutSymbol) {
      //   this.startCheckingDataServiceForAllDataFeeds(dataService);
      // }

      // if (dataService.symbolsToCheck && dataService.symbolsToCheck.length > 0) {
      //   this.startCheckingDataServiceForEachDataFeed(dataService);
      // }

      // if (dataService.checkEachSingleUrl) {
      //   this.startCheckingDataServiceForEachUrl(dataService);
      // }

      this.startCheckingPayloadsFromCacheLayer(dataService);

      // this.startCheckingDataFeedsDeviationIn(dataService);
    }
  }

  startCheckingDataServiceForAllDataFeeds = (
    dataService: DataServiceConfig
  ) => {
    Logger.log(`Starting data service checker job for: ${dataService.id}`);
    const job = new CronJob(dataService.schedule, () => {
      this.checkDataService({
        dataServiceId: dataService.id,
        urls: dataService.urls,
        dataFeedId: "___ALL_FEEDS___",
        uniqueSignersCount: dataService.uniqueSignersCount,
      });
    });
    this.schedulerRegistry.addCronJob(
      `date-service-checker-${dataService.id}`,
      job
    );
    job.start();
  };

  startCheckingDataServiceForEachDataFeed = (
    dataService: DataServiceConfig
  ) => {
    for (const dataFeedId of dataService.dataFeedsToCheck) {
      Logger.log(
        `Starting data service checker job for: ${dataService.id} with data feed: ${dataFeedId}`
      );
      const job = new CronJob(dataService.schedule, () => {
        this.checkDataService({
          dataServiceId: dataService.id,
          dataFeedId,
          urls: dataService.urls,
          uniqueSignersCount: dataService.uniqueSignersCount,
        });
      });
      this.schedulerRegistry.addCronJob(
        `date-service-checker-${dataService.id}-data-feed-${dataFeedId}`,
        job
      );
      job.start();
    }
  };

  startCheckingDataServiceForEachUrl = (dataService: DataServiceConfig) => {
    for (const url of dataService.urls) {
      Logger.log(`Starting single url checker job for: ${dataService.id}`);
      const job = new CronJob(dataService.schedule, () => {
        this.checkSingleUrl({
          dataServiceId: dataService.id,
          minTimestampDiffForWarning: dataService.minTimestampDiffForWarning,
          url,
          dataFeeds: dataService.dataFeedsToCheck,
          uniqueSignersCount: dataService.uniqueSignersCount,
        });
      });
      this.schedulerRegistry.addCronJob(
        `url-checker-${dataService.id}-${JSON.stringify(url)}`,
        job
      );
      job.start();
    }
  };

  startCheckingPayloadsFromCacheLayer = (dataService: DataServiceConfig) => {
    Logger.log(`Starting checking payload from cache layer: ${dataService.id}`);
    const job = new CronJob(dataService.schedule, () => {
      this.checkPayloadsFromCacheLayer(dataService.id, dataService.urls);
    });
    this.schedulerRegistry.addCronJob(
      `cache-layer-payloads-checker-${dataService.id}`,
      job
    );
    job.start();
  };

  startCheckingDataFeedsDeviationIn = (dataService: DataServiceConfig) => {
    const { dataFeedsToCheckDeviation } = dataService;
    for (const [dataFeedId, dataFeedDetails] of Object.entries(
      dataFeedsToCheckDeviation
    )) {
      Logger.log(`Starting data feed deviation checker job for: ${dataFeedId}`);
      const job = new CronJob(dataService.schedule, () => {
        this.checkDataFeedDeviationInTime(
          dataFeedId,
          dataFeedDetails,
          dataService.id
        );
      });
      this.schedulerRegistry.addCronJob(
        `data-feed-deviation-checker-${dataFeedId}`,
        job
      );
      job.start();
    }
  };

  checkDataService = async ({
    dataServiceId,
    dataFeedId,
    urls,
    uniqueSignersCount,
  }: CheckDataServiceInput) => {
    Logger.log(
      `Checking data service: ${dataServiceId}${
        dataFeedId ? " with data feed " + dataFeedId : ""
      }`
    );
    const currentTimestamp = Date.now();

    try {
      const dataPackageResponse = await requestDataPackages(
        {
          dataServiceId,
          uniqueSignersCount,
          dataFeeds: [dataFeedId],
        },
        urls
      );
      await this.checkIfValidNumberOfSignatures({
        dataFeedId,
        dataServiceId,
        dataPackageResponse,
        uniqueSignersCount,
        timestamp: currentTimestamp,
        url: JSON.stringify(urls ?? ""),
      });
    } catch (e) {
      const errStr = stringifyError(e);
      Logger.error(
        `Error occured in data service checker-job ` +
          `(${dataServiceId}-${dataFeedId}). ` +
          `Saving issue in DB: ${errStr}`
      );
      await this.saveErrorInDb({
        timestamp: currentTimestamp,
        dataServiceId,
        type: "data-service-failed",
        url: JSON.stringify(urls),
        comment: errStr,
      });
      await this.sendErrorMessageToUptimeKuma(
        dataServiceId,
        dataFeedId,
        "data-service-failed",
        JSON.stringify(urls)
      );
    }
  };

  checkSingleUrl = async ({
    dataServiceId,
    minTimestampDiffForWarning,
    url,
    dataFeeds,
    uniqueSignersCount,
  }: CheckSingleSourceInput) => {
    const currentTimestamp = Date.now();
    Logger.log(
      `Checking a single url in data service: ${dataServiceId}. ` +
        `Url: ${JSON.stringify(url)}`
    );

    try {
      // Trying to fetch from redstone
      const dataPackageResponse = await requestDataPackages(
        {
          dataServiceId,
          uniqueSignersCount,
          dataFeeds,
        },
        [url]
      );

      for (const dataFeedId of Object.keys(dataPackageResponse)) {
        await this.checkIfValidNumberOfSignatures({
          dataFeedId,
          dataServiceId,
          dataPackageResponse,
          uniqueSignersCount,
          timestamp: currentTimestamp,
          url,
        });
        const dataPackage = dataPackageResponse[dataFeedId][0]?.dataPackage;
        if (dataPackage) {
          const { timestampMilliseconds } = dataPackage;
          const timestampDiff = currentTimestamp - timestampMilliseconds;

          // Saving metric to DB
          this.safelySaveMetricInDB({
            metricName: `timestamp-diff-${dataServiceId}-${dataFeedId}`,
            timestampDiff,
            timestamp: timestampMilliseconds,
            dataServiceId,
            url,
          });
          if (timestampDiff > minTimestampDiffForWarning) {
            Logger.warn(
              `Timestamp diff is quite big: ${timestampDiff}. Saving issue in DB`
            );
            await new this.issueModel({
              timestamp: currentTimestamp,
              type: "timestamp-diff",
              level: "WARNING",
              dataServiceId,
              url,
              timestampDiffMilliseconds: timestampDiff,
            }).save();
          }
        } else {
          Logger.error(
            `Error occurred: no data package for ${dataFeedId}. Saving issue in DB`
          );
          await this.saveErrorInDb({
            timestamp: currentTimestamp,
            dataServiceId,
            type: "no-data-package",
            url,
            comment: `No data package for ${dataFeedId}`,
          });
          await this.sendErrorMessageToUptimeKuma(
            dataServiceId,
            dataFeedId,
            "no-data-package",
            url
          );
        }
      }
    } catch (e) {
      const errStr = stringifyError(e);
      Logger.error(`Error occurred: ${errStr}. Saving issue in DB`);
      await this.saveErrorInDb({
        timestamp: currentTimestamp,
        dataServiceId,
        type: "one-url-failed",
        url,
        comment: errStr,
      });
      await this.sendErrorMessageToUptimeKuma(
        dataServiceId,
        JSON.stringify(dataFeeds),
        "one-url-failed",
        url
      );
    }
  };

  checkIfValidNumberOfSignatures = async ({
    dataPackageResponse,
    dataFeedId,
    dataServiceId,
    uniqueSignersCount,
    timestamp,
    url,
  }: CheckIfValidNumberOfSignaturesInput) => {
    const uniqueDataPointsCount = dataPackageResponse[dataFeedId].length;
    if (uniqueDataPointsCount !== uniqueSignersCount) {
      Logger.error(
        `Invalid number of signatures for ${dataFeedId} from ${url}. Saving issue in DB`
      );
      await this.saveErrorInDb({
        timestamp,
        dataServiceId,
        url,
        type: "invalid-signers-number",
        comment: `Invalid number of signatures for ${dataFeedId}`,
      });
      await this.sendErrorMessageToUptimeKuma(
        dataServiceId,
        dataFeedId,
        "invalid-signers-number",
        url
      );
    }
  };

  checkDataFeedDeviationInTime = async (
    dataFeedId: string,
    dataFeedDetails: DataFeedToCheckDeviationDetails,
    dataServiceId: string
  ) => {
    const apiUrl = "https://api.redstone.finance/prices";
    const currentTimestamp = Date.now();
    const currentPriceResponse = await this.httpService.axiosRef.get(apiUrl, {
      params: {
        symbol: dataFeedId,
        provider: `${dataServiceId}-1`,
        limit: 1,
        toTimestamp: currentTimestamp,
      },
    });
    const currentPrice = currentPriceResponse.data[0].value;
    const pastTimestamp =
      currentTimestamp - dataFeedDetails.timePeriodInMilliseconds;
    const pastPriceResponse = await this.httpService.axiosRef.get(apiUrl, {
      params: {
        symbol: dataFeedId,
        provider: `${dataServiceId}-1`,
        limit: 1,
        toTimestamp: pastTimestamp,
      },
    });
    const pastPrice = pastPriceResponse.data[0].value;
    const pricesDifference = pastPrice - currentPrice;
    const pricesMin = Math.min(pastPrice, currentPrice);
    const deviation = (100 * Math.abs(pricesDifference)) / pricesMin;
    if (deviation >= dataFeedDetails.deviationLimitToNotify) {
      const isPriceIncreasing = pricesDifference > 0;
      const priceMsg = `${isPriceIncreasing ? "increased" : "decreased"}`;
      Logger.error(
        `Deviation for ${dataFeedId} is higher than limit ${dataFeedDetails.deviationLimitToNotify}. Price ${priceMsg} ${deviation}.`
      );
      await this.sendErrorMessageToUptimeKuma(
        dataServiceId,
        dataFeedId,
        `deviation-higher-than-limit`,
        `price-${priceMsg}-${deviation.toFixed(2)}%`
      );
    }
  };

  // TODO: Hmm, why do we have urls here?
  checkPayloadsFromCacheLayer = (dataServiceId: string, urls: string[]) => {
    const timestamp = Date.now();
    Logger.log(
      `Checking payloads: ${dataServiceId} from cache layers. ${timestamp}`
    );
    exec(
      `
        [ ! -d "redstone-evm-examples" ] && git clone -b tests-for-monitoring-service https://github.com/redstone-finance/redstone-evm-examples.git;
        cd redstone-evm-examples &&
        [ ! -d "node_modules" ] && yarn;
        yarn test test/AvalancheProdExample.js
      `,
      async (error, stdout, stderr) => {
        if (error) {
          Logger.error(
            `Tests from evm-examples failed. Stdout: ${stdout}. Stderr: ${stderr}`
          );

          await this.sendErrorMessageToUptimeKuma(
            dataServiceId,
            "data-feeds-from-evm-examples",
            "cache-layer-payloads-failed",
            JSON.stringify(urls)
          );

          await this.saveErrorInDb({
            timestamp: Date.now(),
            dataServiceId,
            type: "cache-layer-payloads-failed",
            url: JSON.stringify(urls),
            comment: "Payloads received from cache layer payload failed",
          });
        } else {
          Logger.log(`Tests passed. ${timestamp}`);
        }
      }
    );
  };

  safelySaveMetricInDB = async ({
    metricName,
    timestampDiff,
    timestamp,
    dataServiceId,
    url,
  }: SaveMetricInput) => {
    try {
      Logger.log(
        `Saving metric to DB. Name: ${metricName}, Value: ${timestampDiff}`
      );
      await new this.metricModel({
        name: metricName,
        value: timestampDiff,
        timestamp,
        tags: {
          dataServiceId,
          url,
        },
      }).save();
    } catch (e) {
      Logger.error(`Metric saving failed: ${stringifyError(e)}`);
    }
  };

  saveErrorInDb = async ({
    timestamp,
    dataServiceId,
    url,
    type,
    comment,
  }: SaveErrorInput) => {
    await new this.issueModel({
      timestamp,
      type,
      level: "ERROR",
      dataServiceId,
      url,
      comment,
    }).save();
  };

  sendErrorMessageToUptimeKuma = async (
    dataServiceId: string,
    symbol: string,
    type: string,
    urlOrOther: string
  ) => {
    const uptimeKumaUrl = this.configService.get("UPTIME_KUMA_URL");
    const uptimeKumaUrlWithMessage = `${uptimeKumaUrl}&msg=${dataServiceId}-${symbol}-${type}-${urlOrOther}`;
    if (uptimeKumaUrl) {
      await this.httpService.axiosRef.get(uptimeKumaUrlWithMessage);
    }
  };
}
