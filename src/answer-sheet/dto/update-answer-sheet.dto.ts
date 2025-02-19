import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { AnswerSheetAnswerDto } from './answer-sheet-answer.dto';

export class UpdateAnswerSheetDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AnswerSheetAnswerDto)
  answers: AnswerSheetAnswerDto[];
}
