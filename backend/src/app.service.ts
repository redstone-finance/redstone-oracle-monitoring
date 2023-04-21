import { Injectable } from "@nestjs/common";
import { CronService } from "./modules/cron/cron.service";

@Injectable()
export class AppService {
  constructor(private readonly cronService: CronService) {
    this.cronService.addCronJobs();
  }
}
