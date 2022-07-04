import express from "express";
import { fetchMetricsByName } from "../helpers/fetch-metrics-by-name";
import { fetchMetricsNames } from "../helpers/fetch-metrics-names";
import { generateIssuesAnalysis } from "../tools/generate-issues-analysis";

const router = express.Router();

export const buildRoutes = () => {
  router.get("/api/issues/:timeframe", async (req, res) => {
    const toTimestamp = Date.now();
    const timeframe = Number(req.params["timeframe"]);
    const fromTimestamp = toTimestamp - timeframe;
    const issuesAnalysis = await generateIssuesAnalysis(
      fromTimestamp,
      toTimestamp
    );
    res.send({ issuesAnalysis });
  });

  router.get("/api/metrics-names", async (req, res) => {
    const names = await fetchMetricsNames();
    res.send({ names });
  });

  router.get("/api/metrics/:timeframe", async (req, res) => {
    const toTimestamp = Date.now();
    const timeframe = Number(req.params["timeframe"]);
    const fromTimestamp = toTimestamp - timeframe;
    const name = req.query["name"] as string;
    const metrics = await fetchMetricsByName(fromTimestamp, name);
    res.send({ metrics });
  });

  return router;
};
