import { Module } from "@nestjs/common";
import { IssuesController } from "./issues.controller";
import { IssuesService } from "./issues.service";

@Module({
  imports: [],
  controllers: [IssuesController],
  providers: [IssuesService],
})
export class IssuesModule {}
