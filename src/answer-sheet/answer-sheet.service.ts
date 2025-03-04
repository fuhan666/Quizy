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

@Injectable()
export class AnswerSheetService {
  constructor(
    @InjectModel(AnswerSheet.name)
    private readonly answerSheetModel: Model<AnswerSheet>,
  ) {}
  create({ userId, correctAnswers }: CreateAnswerSheetDto) {
    const answerSheet = new this.answerSheetModel({
      userId,
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

    this.calculateScore(id);
    return 'Submission successfully';
  }

  remove(id: mongoose.Types.ObjectId) {
    return this.answerSheetModel.findByIdAndDelete(id);
  }

  async calculateScore(id: mongoose.Types.ObjectId) {
    let totalScore = 0;

    const answerSheetDocument = await this.answerSheetModel.findById(id);
    if (!answerSheetDocument) return;

    const answers = answerSheetDocument.answers as AnswerSheetAnswerDto[];
    if (!answers || answers.length === 0) return;

    const answersMap = answers.reduce((acc, answer) => {
      acc.set(answer.order, answer);
      return acc;
    }, new Map<number, AnswerSheetAnswerDto>());

    const correctAnswers = answerSheetDocument.correctAnswers;
    for (const {
      order,
      questionType,
      score,
      choiceAnswerIds,
      fillInBlankAnswers,
    } of correctAnswers) {
      if (!answersMap.has(order)) continue;

      const answer = answersMap.get(order);
      switch (questionType) {
        case QuestionTypeEnum.SINGLE_CHOICE:
        case QuestionTypeEnum.MULTIPLE_CHOICE:
          if (
            choiceAnswerIds &&
            this.areArraysEqualRegardlessOrder(
              choiceAnswerIds,
              answer?.answerIds || [],
            )
          ) {
            totalScore += score;
          }
          break;
        case QuestionTypeEnum.FILL_IN_BLANK:
          if (
            fillInBlankAnswers &&
            fillInBlankAnswers.some((a) => a === answer?.answerText)
          ) {
            totalScore += score;
          }
          break;
      }
    }
    await this.answerSheetModel.findByIdAndUpdate(id, { score: totalScore });
  }

  areArraysEqualRegardlessOrder(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;

    const countMap = new Map<string, number>();

    arr1.forEach((element) => {
      countMap.set(element, (countMap.get(element) || 0) + 1);
    });

    for (const element of arr2) {
      const count = countMap.get(element);
      if (!count) {
        return false;
      }
      if (count === 1) {
        countMap.delete(element);
      } else {
        countMap.set(element, count - 1);
      }
    }

    return true;
  }
}
