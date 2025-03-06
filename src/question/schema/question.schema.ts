import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
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

  @Prop({
    required: true,
    enum: QuestionStatus,
    default: QuestionStatus.UNUSED,
  })
  status: QuestionStatus;

  @Prop({ required: true, type: [mongoose.Types.ObjectId], default: [] })
  paperIds: mongoose.Types.ObjectId[];

  @Prop({
    type: Map,
    of: String,
    required: true,
  })
  answers: Map<string, string>;

  @Prop({ type: Number })
  relatedFileId?: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
