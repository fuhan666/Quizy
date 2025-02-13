import { QuestionType } from './question-type.dto';

export class QA {
  questionId: number;
  questionType: QuestionType;
  answerIds: number[];
  correctAnswerIds: number[];
}
