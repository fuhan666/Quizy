import { PickType } from '@nestjs/mapped-types';
import { PaperQuestionDto } from './paper-question.dto';
import { IsString } from 'class-validator';

export class PaperQuestionDetailDto extends PickType(PaperQuestionDto, [
  'questionId',
  'questionType',
  'score',
  'correctAnswerIds',
]) {
  @IsString()
  questionText: string;

  answers: { [key: string]: string };
}
