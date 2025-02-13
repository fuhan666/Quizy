import { AnswerEntity, QuestionEntity } from '@prisma/client';
import { QuestionType } from './question-type.dto';

export class QA {
  questionId: number;
  question: QuestionEntity;
  questionType: QuestionType;
  answers: AnswerEntity[];
  correctAnswerIds: number[];
}
