import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ApiException } from 'src/exceptions/api.exception';
import { QA } from './dto/qa.dto';

@Injectable()
export class PaperService {
  constructor(private _prisma: PrismaService) {}

  async create(userId: number, { qas }: CreatePaperDto) {
    await this._validateQAs(userId, qas);
    const data: Prisma.PaperEntityCreateInput = {
      user: { connect: { id: userId } },
      qas: JSON.stringify(qas),
    };
    const newPaper = this._prisma.paperEntity.create({ data });
    return newPaper;
  }

  findAll(userId: number) {
    return this._prisma.paperEntity.findMany({ where: { userId } });
  }

  async findOne(userId: number, id: number) {
    const paperRecord = await this._prisma.paperEntity.findUniqueOrThrow({
      where: { id, userId },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    paperRecord.qas = JSON.parse(paperRecord.qas as string);
    return paperRecord;
  }

  async update(userId: number, id: number, { qas }: UpdatePaperDto) {
    await this._prisma.paperEntity.findUniqueOrThrow({
      where: { id, userId },
    });
    await this._validateQAs(userId, qas);
    const data: Prisma.PaperEntityUpdateInput = {
      qas: JSON.stringify(qas),
    };
    const updatedPaper = this._prisma.paperEntity.update({
      where: { id },
      data,
    });
    return updatedPaper;
  }

  remove(userId: number, id: number) {
    return this._prisma.paperEntity.deleteMany({ where: { id, userId } });
  }

  private async _validateQAs(userId: number, qas: QA[]) {
    const uniqueQuestionIds = new Set(qas.map((qa) => qa.questionId));
    const questions = await this._prisma.questionEntity.findMany({
      where: { id: { in: [...uniqueQuestionIds] }, userId },
      include: { answers: true },
    });
    if (questions.length !== uniqueQuestionIds.size) {
      throw new ApiException(
        'Contains a question that does not exist or has no permissions',
        HttpStatus.BAD_REQUEST,
      );
    }
    const questionMap = new Map(
      questions.map((question) => [question.id, question]),
    );
    for (const { questionId, answerIds, correctAnswerIds } of qas) {
      const question = questionMap.get(questionId);
      if (!question) {
        continue;
      }
      const relatedAnswerIds = question.answers.map((answer) => answer.id);
      if (!answerIds || answerIds.length === 0) {
        throw new ApiException(
          'The question must have at least one answer',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!answerIds.every((answerId) => relatedAnswerIds.includes(answerId))) {
        throw new ApiException(
          'Contains an answer that does not exist or has no permissions',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (
        !correctAnswerIds.every((correctAnswerId) =>
          answerIds.includes(correctAnswerId),
        )
      ) {
        throw new ApiException(
          'Correct answer must be in the answer list',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
