import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiException } from 'src/exceptions/api.exception';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnswerService {
  constructor(private _prisma: PrismaService) {}

  async create(userId: number, { questionId, answerText }: CreateAnswerDto) {
    const question = await this._prisma.questionEntity.findUnique({
      where: { id: questionId },
    });
    if (!question || question.userId !== userId) {
      throw new ApiException(
        'Question not found or no permission to operate on this question',
        HttpStatus.BAD_REQUEST,
      );
    }
    const data: Prisma.AnswerEntityCreateInput = {
      question: { connect: { id: questionId } },
      answerText,
    };
    return this._prisma.answerEntity.create({ data });
  }

  findAll(userId: number) {
    return this._prisma.answerEntity.findMany({
      where: { question: { userId } },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(userId: number, id: number) {
    const answerRecord = await this._prisma.answerEntity.findUniqueOrThrow({
      where: { id, question: { userId } },
      include: { question: true },
    });
    return answerRecord;
  }

  async update(userId: number, id: number, { answerText }: UpdateAnswerDto) {
    const answerRecord = await this._prisma.answerEntity.findUniqueOrThrow({
      where: { id, question: { userId } },
      include: { question: true },
    });
    const data: Prisma.AnswerEntityUpdateInput = { answerText };
    return this._prisma.answerEntity.update({ where: { id }, data });
  }

  async remove(userId: number, id: number) {
    return this._prisma.answerEntity.delete({
      where: { id, question: { userId } },
    });
  }
}
