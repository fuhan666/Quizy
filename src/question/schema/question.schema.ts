import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { QuestionStatus } from '../dto/question-status.enum';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: true, collection: 'question' })
export class Question {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  questionText: string;

  @Prop({ required: true, default: 1 })
  difficulty: number;

  @Prop({ required: true, default: QuestionStatus.UNUSED })
  status: number;

  @Prop({
    type: Map,
    of: String,
    required: true,
  })
  answers: Map<string, string>;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
