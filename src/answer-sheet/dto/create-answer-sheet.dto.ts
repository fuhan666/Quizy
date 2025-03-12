import { AnswerSheetCorrectAnswerType } from './answer-sheet-correct-answer.dto';
import { Types } from 'mongoose';
export class CreateAnswerSheetDto {
  userId: number;
  paperId: Types.ObjectId;
  correctAnswers: AnswerSheetCorrectAnswerType[];
}
