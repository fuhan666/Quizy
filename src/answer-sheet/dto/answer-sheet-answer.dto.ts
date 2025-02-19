import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsString,
} from 'class-validator';

export class AnswerSheetAnswerDto {
  @IsNumber()
  @IsPositive()
  order: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  answerIds?: string[];

  @IsOptional()
  answerText?: string | boolean;
}
