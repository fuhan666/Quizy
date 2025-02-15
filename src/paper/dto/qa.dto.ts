enum QuestionTypeEnum {
  SINGLE_CHOICE = 1,
  MULTIPLE_CHOICE,
  TRUE_FALSE,
  FILL_IN_BLANK,
}
export type QA = {
  questionId: number;
  questionType: QuestionTypeEnum;
  answerIds: number[];
  correctAnswerIds: number[];
};
