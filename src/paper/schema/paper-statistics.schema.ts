import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaperStatisticsDocument = HydratedDocument<PaperStatistics>;

@Schema({ timestamps: true, collection: 'paper_statistics' })
export class PaperStatistics {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Paper' })
  paperId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Question' })
  questionId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  totalAttempts: number;

  @Prop({ required: true, default: 0 })
  correctAttempts: number;
}

export const PaperStatisticsSchema =
  SchemaFactory.createForClass(PaperStatistics);
