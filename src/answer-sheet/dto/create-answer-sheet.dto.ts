import { AnswerSheetCorrectAnswerType } from './answer-sheet-correct-answer.dto';

export class CreateAnswerSheetDto {
  userId: number;
  correctAnswers: AnswerSheetCorrectAnswerType[];
}
