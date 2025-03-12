import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PaperQuestionStatsDocument = HydratedDocument<PaperQuestionStats>;

@Schema({ timestamps: true, collection: 'paper_question_stats' })
export class PaperQuestionStats {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Paper' })
  paperId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Question' })
  questionId: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  totalAttempts: number;

  @Prop({ required: true, default: 0 })
  correctAttempts: number;
}

export const PaperQuestionStatsSchema =
  SchemaFactory.createForClass(PaperQuestionStats);
