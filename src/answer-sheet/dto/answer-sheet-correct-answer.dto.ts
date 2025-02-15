import { QuestionTypeEnum } from 'src/paper/dto/question-type.enum';

export type AnswerSheetCorrectAnswerType = {
  order: number;
  questionId: number;
  questionType: QuestionTypeEnum;
  choiceAnswerIds?: number[];
  fillInBlankAnswers?: string[];
  trueFalseAnswer?: boolean;
};
