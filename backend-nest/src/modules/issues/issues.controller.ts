import { Controller, Get, Param } from "@nestjs/common";
import { IssuesService } from "./issues.service";

@Controller("/api/issues")
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get(":timeframe")
  async getIssuesByTimeframe(@Param("timeframe") timeframe: number) {
    return {
      issuesAnalysis: await this.issuesService.getIssuesByTimeframe(timeframe),
    };
  }
}
