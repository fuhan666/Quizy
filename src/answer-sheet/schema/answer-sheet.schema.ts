import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AnswerSheetCorrectAnswerType } from '../dto/answer-sheet-correct-answer.dto';
export type AnswerSheetDocument = HydratedDocument<AnswerSheet>;

@Schema({ timestamps: true, collection: 'answer_sheet' })
export class AnswerSheet {
  @Prop({ required: true })
  userId: number;

  @Prop()
  score: number;

  @Prop({ type: Array, required: true })
  correctAnswers: AnswerSheetCorrectAnswerType[];

  @Prop({ type: Array })
  answers: any[];

  @Prop({ required: true })
  startedAt: Date;

  @Prop()
  finishedAt: Date;
}

export const AnswerSheetSchema = SchemaFactory.createForClass(AnswerSheet);
