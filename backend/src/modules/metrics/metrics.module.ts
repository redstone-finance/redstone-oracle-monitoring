import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MetricsController } from "./metrics.controller";
import { Metric, MetricSchema } from "./metrics.schema";
import { MetricsService } from "./metrics.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Metric.name, schema: MetricSchema }]),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MongooseModule],
})
export class MetricsModule {}
