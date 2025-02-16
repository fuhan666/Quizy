import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class UpdateAnswerSheetDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AnswerSheetAnswerDto)
  answers: AnswerSheetAnswerDto[];
}

class AnswerSheetAnswerDto {
  @IsNumber()
  @IsPositive()
  order: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsPositive({ each: true })
  answerIds?: number[];

  @IsOptional()
  answer?: string | boolean;
}
