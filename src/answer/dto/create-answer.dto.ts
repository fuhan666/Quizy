import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsNumber()
  @IsPositive()
  questionId: number;
  @IsString()
  @IsNotEmpty()
  answerText: string;
}
