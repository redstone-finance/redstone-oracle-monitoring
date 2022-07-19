import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { IssuesModule } from "./modules/issues/issues.module";
import { MetricsModule } from "./modules/metrics/metrics.module";

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../../frontend/dist"),
    }),
    IssuesModule,
    MetricsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
