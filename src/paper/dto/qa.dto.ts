import {
  IsArray,
  IsEnum,
  IsNumber,
  ArrayNotEmpty,
  IsPositive,
} from 'class-validator';

enum QuestionTypeEnum {
  SINGLE_CHOICE = 1,
  MULTIPLE_CHOICE,
  TRUE_FALSE,
  FILL_IN_BLANK,
}

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
