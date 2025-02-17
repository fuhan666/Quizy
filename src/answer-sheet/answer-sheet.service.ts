import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAnswerSheetDto } from './dto/create-answer-sheet.dto';
import { UpdateAnswerSheetDto } from './dto/update-answer-sheet.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { instanceToPlain } from 'class-transformer';
import { QuestionTypeEnum } from 'src/paper/dto/question-type.enum';
import { AnswerSheetCorrectAnswerType } from './dto/answer-sheet-correct-answer.dto';

@Injectable()
export class AnswerSheetService {
  constructor(private _prisma: PrismaService) {}
  create({ userId, correctAnswers }: CreateAnswerSheetDto) {
    const data: Prisma.AnswerSheetEntityCreateInput = {
      user: { connect: { id: userId } },
      correctAnswers: correctAnswers as Prisma.JsonArray,
      startTime: new Date(),
    };
    return this._prisma.answerSheetEntity.create({ data });
  }

  findAll() {
    return `This action returns all answerSheet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} answerSheet`;
  }

  async update(id: number, userId: number, { answers }: UpdateAnswerSheetDto) {
    const orders = answers.map((answer) => answer.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== answers.length) {
      throw new BadRequestException(
        'Answer sheet contains duplicate order values',
      );
    }

    const data: Prisma.AnswerSheetEntityUpdateInput = {
      answers: instanceToPlain(answers),
      finishTime: new Date(),
    };
    await this._prisma.answerSheetEntity.update({
      where: { id, userId },
      data,
    });

    this.calculateScore(id);
    return 'Submission successfully';
  }

  remove(id: number) {
    return `This action removes a #${id} answerSheet`;
  }

  async calculateScore(id: number) {
    let totalScore = 0;

    const answerSheetRecord =
      await this._prisma.answerSheetEntity.findUniqueOrThrow({ where: { id } });

    const answers = answerSheetRecord.answers as Prisma.JsonArray;
    if (!answers || answers.length === 0) return;
    const answersMap = answers.reduce((acc, answer) => {
      acc.set((answer as any).order, answer);
      return acc;
    }, new Map());

    const correctAnswers =
      answerSheetRecord.correctAnswers as AnswerSheetCorrectAnswerType[];
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
              answer.answerIds,
            )
          ) {
            totalScore += score;
          }
          break;
        case QuestionTypeEnum.FILL_IN_BLANK:
          if (
            fillInBlankAnswers &&
            fillInBlankAnswers.some((a) => a === answer.answer)
          ) {
            totalScore += score;
          }
          break;
      }
    }
    await this._prisma.answerSheetEntity.update({
      where: { id },
      data: { score: totalScore },
    });
  }

  areArraysEqualRegardlessOrder(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) return false;

    const countMap = new Map<number, number>();

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
