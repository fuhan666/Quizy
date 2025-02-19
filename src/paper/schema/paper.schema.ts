import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PaperQuestionDto } from '../dto/qa.dto';
import { PaperPermissionsDto } from '../dto/paper-permission.dto';
export type PaperDocument = HydratedDocument<Paper>;

@Schema({ timestamps: true, collection: 'paper' })
export class Paper {
  @Prop({ required: true })
  userId: number;

  @Prop({ type: Array, required: true })
  paperQuestions: PaperQuestionDto[];

  @Prop({ type: Object })
  permissions?: PaperPermissionsDto;
}

export const PaperSchema = SchemaFactory.createForClass(Paper);
