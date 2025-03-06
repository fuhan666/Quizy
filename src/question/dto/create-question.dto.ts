import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  questionText: string;

  @IsNumber()
  @IsOptional()
  difficulty?: number;

  @IsArray()
  @IsString({ each: true })
  answers: string[];

  @IsNumber()
  @IsOptional()
  relatedFileId?: number;
}
