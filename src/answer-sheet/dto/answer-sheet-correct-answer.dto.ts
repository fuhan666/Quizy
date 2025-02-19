import mongoose from 'mongoose';
import { QuestionTypeEnum } from 'src/paper/dto/question-type.enum';

export type AnswerSheetCorrectAnswerType = {
  order: number;
  questionId: mongoose.Types.ObjectId;
  questionType: QuestionTypeEnum;
  score: number;
  choiceAnswerIds?: string[];
  fillInBlankAnswers?: string[];
  trueFalseAnswer?: boolean;
};
