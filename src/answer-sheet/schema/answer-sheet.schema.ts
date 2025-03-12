import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AnswerSheetCorrectAnswerType } from '../dto/answer-sheet-correct-answer.dto';
import { AnswerSheetAnswerDto } from '../dto/answer-sheet-answer.dto';
export type AnswerSheetDocument = HydratedDocument<AnswerSheet>;

@Schema({ timestamps: true, collection: 'answer_sheet' })
export class AnswerSheet {
  @Prop({ type: Types.ObjectId, required: true, ref: 'Paper' })
  paperId: Types.ObjectId;

  @Prop({ required: true })
  userId: number;

  @Prop()
  score: number;

  @Prop({ type: Array, required: true })
  correctAnswers: AnswerSheetCorrectAnswerType[];

  @Prop({ type: Array })
  answers: AnswerSheetAnswerDto[];

  @Prop({ required: true })
  startedAt: Date;

  @Prop()
  finishedAt: Date;
}

export const AnswerSheetSchema = SchemaFactory.createForClass(AnswerSheet);
