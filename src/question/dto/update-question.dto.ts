import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateQuestionDto {
  @IsString()
  @IsOptional()
  questionText?: string;

  @IsNumber()
  @IsOptional()
  difficulty?: number;

  @IsOptional()
  remainAnswers: Map<string, string>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deleteAnswerIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  newAnswers?: string[];
}
