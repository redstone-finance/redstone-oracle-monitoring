import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { MongooseModule } from "@nestjs/mongoose";
import { join } from "path";
import { IssuesModule } from "./modules/issues/issues.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { CronModule } from "./modules/cron/cron.module";
import { AppService } from "./app.service";
import { mongoDbUrl } from "./config";

@Module({
  imports: [
    MongooseModule.forRoot(mongoDbUrl),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../../../frontend/dist"),
    }),
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    IssuesModule,
    MetricsModule,
    CronModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
