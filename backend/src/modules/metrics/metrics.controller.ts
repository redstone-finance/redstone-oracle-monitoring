import { Controller, Get, Param, Query } from "@nestjs/common";
import { MetricsService } from "./metrics.service";

@Controller("/api/metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get("metrics-names")
  async getMetricsNames() {
    return { names: await this.metricsService.getMetricsNames() };
  }

  @Get(":timeframe")
  async getMetricsByTimeframe(
    @Param("timeframe") timeframe: number,
    @Query("name") name: string
  ) {
    return {
      metrics: await this.metricsService.getMetricsByTimeframe(timeframe, name),
    };
  }
}
