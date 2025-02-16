import {
  IsArray,
  IsEnum,
  IsNumber,
  ArrayNotEmpty,
  IsPositive,
} from 'class-validator';
import { QuestionTypeEnum } from './question-type.enum';

export class QA {
  @IsNumber()
  @IsPositive()
  questionId: number;

  @IsEnum(QuestionTypeEnum)
  questionType: QuestionTypeEnum;

  @IsArray()
  @ArrayNotEmpty()
  @IsPositive({ each: true })
  answerIds: number[];

  @IsArray()
  @ArrayNotEmpty()
  @IsPositive({ each: true })
  correctAnswerIds: number[];
}
