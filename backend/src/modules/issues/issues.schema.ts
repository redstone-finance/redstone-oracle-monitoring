import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type IssueDocument = Issue & Document;

@Schema()
export class Issue {
  @Prop({ required: true })
  timestamp: number;

  @Prop({ required: true })
  type:
    | "timestamp-diff"
    | "no-data-package"
    | "one-url-failed"
    | "data-service-failed"
    | "invalid-signers-number"
    | "cache-layer-payloads-failed";

  @Prop()
  symbol: string;

  @Prop({ required: true })
  level: "ERROR" | "WARNING";

  @Prop({ required: true })
  dataServiceId: string;

  @Prop()
  url: string;

  @Prop()
  comment: string;

  @Prop()
  timestampDiffMilliseconds: number;
}

export const IssueSchema = SchemaFactory.createForClass(Issue);
