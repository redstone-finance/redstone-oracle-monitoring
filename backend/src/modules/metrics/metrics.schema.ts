import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MetricDocument = Metric & Document;

@Schema()
class Tag extends Document {
  @Prop()
  dataFeedId: string;

  @Prop()
  url: string;
}

@Schema()
export class Metric {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  timestamp: number;

  @Prop()
  tags: Tag;
}

export const MetricSchema = SchemaFactory.createForClass(Metric);
