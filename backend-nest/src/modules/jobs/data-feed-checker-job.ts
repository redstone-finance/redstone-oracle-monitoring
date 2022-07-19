import redstone from "redstone-api-extended";
import consola from "consola";
import { DataFeedId } from "redstone-api-extended/lib/oracle/redstone-data-feed";
import { stringifyError } from "src/shared/error-stringifier";
import { Issue } from "../issues/issues.model";

interface Input {
  dataFeedId: DataFeedId;
  symbol?: string;
}

export const execute = async ({ dataFeedId, symbol }: Input) => {
  const logger = consola.withTag(
    `data-feed-checker-job-${dataFeedId}-${symbol}`
  );
  logger.info(
    `Checking data feed: ${dataFeedId}${symbol ? " with symbol " + symbol : ""}`
  );
  const currentTimestamp = Date.now();

  try {
    await redstone.oracle.getFromDataFeed(dataFeedId, symbol);
  } catch (e) {
    const errStr = stringifyError(e);
    logger.error(
      `Error occured in data feed checker-job ` +
        `(${dataFeedId}-${symbol}). ` +
        `Saving issue in DB: ${errStr}`
    );
    await new Issue({
      timestamp: currentTimestamp,
      type: "data-feed-failed",
      symbol,
      level: "ERROR",
      dataFeedId,
      comment: errStr,
    }).save();
  }
};
