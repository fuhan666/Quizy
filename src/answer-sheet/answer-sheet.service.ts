import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAnswerSheetDto } from './dto/create-answer-sheet.dto';
import { UpdateAnswerSheetDto } from './dto/update-answer-sheet.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { instanceToPlain } from 'class-transformer';

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
    return 'Submission successfully';
  }

  remove(id: number) {
    return `This action removes a #${id} answerSheet`;
  }
}
