import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PaperQuestionDto } from '../dto/paper-question.dto';
import { PaperPermissionsDto } from '../dto/paper-permission.dto';
import { PaperStatus } from '../dto/paper-status.enum';

export type PaperDocument = HydratedDocument<Paper>;

@Schema({ timestamps: true, collection: 'paper' })
export class Paper {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  paperName: string;

  @Prop({ type: Array, required: true })
  paperQuestions: PaperQuestionDto[];

  @Prop({ type: Object })
  permissions?: PaperPermissionsDto;

  @Prop({ required: true, enum: PaperStatus, default: PaperStatus.DRAFT })
  status: PaperStatus;

  @Prop({ type: Boolean, default: false })
  shuffleQuestions: boolean;
}

export const PaperSchema = SchemaFactory.createForClass(Paper);
