import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class GenerateQuestionsDto {
  @IsNumber()
  @IsPositive()
  fileId: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  numberOfQuestions?: number;

  @IsString()
  @IsOptional()
  targetLanguage?: string;
}
