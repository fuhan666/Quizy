import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateAnswerSheetDto } from './dto/create-answer-sheet.dto';
import { UpdateAnswerSheetDto } from './dto/update-answer-sheet.dto';
import { QuestionTypeEnum } from 'src/paper/dto/question-type.enum';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AnswerSheet } from './schema/answer-sheet.schema';
import { AnswerSheetAnswerDto } from './dto/answer-sheet-answer.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AnswerSheetCorrectAnswerType } from './dto/answer-sheet-correct-answer.dto';
import { areArraysEqualRegardlessOrder } from 'src/shared/utils/array.utils';

@Injectable()
export class AnswerSheetService {
  constructor(
    @InjectModel(AnswerSheet.name)
    private readonly answerSheetModel: Model<AnswerSheet>,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  create({ userId, paperId, correctAnswers }: CreateAnswerSheetDto) {
    const answerSheet = new this.answerSheetModel({
      userId,
      paperId,
      correctAnswers,
      startedAt: new Date(),
    });
    return answerSheet.save();
  }

  findAll() {
    return `This action returns all answerSheet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} answerSheet`;
  }

  async update(
    id: mongoose.Types.ObjectId,
    userId: number,
    { answers }: UpdateAnswerSheetDto,
  ) {
    const orders = answers.map((a) => a.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== answers.length) {
      throw new UnprocessableEntityException(
        'Answer sheet contains duplicate order values',
      );
    }

    const answerSheet = await this.answerSheetModel.findById(id);
    if (!answerSheet) {
      throw new NotFoundException('Answer sheet not found');
    }
    if (answerSheet.userId !== userId) {
      throw new NotFoundException('Answer sheet not found');
    }
    answerSheet.answers = answers;
    answerSheet.finishedAt = new Date();
    await answerSheet.save();

    this.eventEmitter.emit('answer-sheet.submitted', id);
    return 'Submission successfully';
  }

  remove(id: mongoose.Types.ObjectId) {
    return this.answerSheetModel.findByIdAndDelete(id);
  }

  isAnswerCorrect(
    userAnswer: AnswerSheetAnswerDto | undefined,
    {
      questionType,
      choiceAnswerIds,
      fillInBlankAnswers,
    }: AnswerSheetCorrectAnswerType,
  ): boolean {
    if (!userAnswer) return false;

    switch (questionType) {
      case QuestionTypeEnum.SINGLE_CHOICE:
      case QuestionTypeEnum.MULTIPLE_CHOICE:
        return Boolean(
          choiceAnswerIds &&
            areArraysEqualRegardlessOrder(
              choiceAnswerIds,
              userAnswer.answerIds || [],
            ),
        );
      case QuestionTypeEnum.FILL_IN_BLANK:
        return Boolean(
          fillInBlankAnswers &&
            fillInBlankAnswers.some((a) => a === userAnswer.answerText),
        );
      default:
        return false;
    }
  }
}
