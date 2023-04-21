import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { IssuesController } from "./issues.controller";
import { Issue, IssueSchema } from "./issues.schema";
import { IssuesService } from "./issues.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Issue.name, schema: IssueSchema }]),
  ],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [MongooseModule],
})
export class IssuesModule {}
