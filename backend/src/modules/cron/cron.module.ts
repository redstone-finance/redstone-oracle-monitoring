import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { IssuesModule } from "../issues/issues.module";
import { MetricsModule } from "../metrics/metrics.module";
import { CronService } from "./cron.service";

@Module({
  imports: [IssuesModule, MetricsModule, HttpModule, ConfigModule],
  controllers: [],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
