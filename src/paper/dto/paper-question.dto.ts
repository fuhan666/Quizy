import {
  IsArray,
  IsEnum,
  IsNumber,
  ArrayNotEmpty,
  IsPositive,
  IsString,
  IsMongoId,
} from 'class-validator';
import { QuestionTypeEnum } from './question-type.enum';
import mongoose from 'mongoose';

export class PaperQuestionDto {
  @IsMongoId()
  questionId: mongoose.Types.ObjectId;

  @IsEnum(QuestionTypeEnum)
  questionType: QuestionTypeEnum;

  @IsNumber()
  @IsPositive()
  score: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answerIds: string[];

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  correctAnswerIds: string[];
}
