import { HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ApiException } from 'src/common/exceptions/api.exception';
import { QA } from './dto/qa.dto';
import { PaperPermissionsDto } from './dto/paper-permission.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class PaperService {
  constructor(private _prisma: PrismaService) {}

  private _queryPaperPermissionWhere = (userId: number) => [
    { userId },
    {
      permissions: {
        path: ['accessibleByUserIds'],
        array_contains: userId,
      },
    },
    {
      permissions: {
        path: ['public'],
        equals: true,
      },
    },
  ];

  async create(userId: number, dto: CreatePaperDto) {
    await this._validatePermissions(dto?.permissions);
    await this._validateQAs(userId, dto.qas);
    const data: Prisma.PaperEntityCreateInput = {
      user: { connect: { id: userId } },
      qas: instanceToPlain(dto.qas),
      permissions: dto?.permissions as Prisma.JsonObject,
    };
    return this._prisma.paperEntity.create({ data });
  }

  findAll(userId: number) {
    return this._prisma.paperEntity.findMany({
      where: {
        OR: this._queryPaperPermissionWhere(userId),
      },
      omit: {
        permissions: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(userId: number, id: number) {
    const paperRecord = await this._prisma.paperEntity.findUniqueOrThrow({
      where: { id, OR: this._queryPaperPermissionWhere(userId) },
    });
    if (paperRecord.userId !== userId) {
      const { permissions: _, ...rest } = paperRecord;
      return rest;
    }
    return paperRecord;
  }

  async update(
    userId: number,
    id: number,
    { qas, permissions }: UpdatePaperDto,
  ) {
    await this._prisma.paperEntity.findUniqueOrThrow({
      where: { id, userId },
    });
    await this._validatePermissions(permissions);
    await this._validateQAs(userId, qas);
    const data: Prisma.PaperEntityUpdateInput = {};
    if (qas !== undefined) {
      data.qas = instanceToPlain(qas);
    }
    if (permissions !== undefined) {
      data.permissions = permissions as Prisma.JsonObject;
    }
    return this._prisma.paperEntity.update({
      where: { id },
      data,
    });
  }

  remove(userId: number, id: number) {
    return this._prisma.paperEntity.deleteMany({ where: { id, userId } });
  }

  private async _validateQAs(userId: number, qas: QA[] | undefined) {
    if (!qas) return;
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

  private async _validatePermissions(permissions?: PaperPermissionsDto) {
    if (!permissions) return;
    if (permissions?.public) return;
    if (
      permissions?.accessibleByUserIds &&
      permissions.accessibleByUserIds.length > 0
    ) {
      const users = await this._prisma.userEntity.findMany({
        where: { id: { in: permissions.accessibleByUserIds } },
      });

      if (users.length !== permissions.accessibleByUserIds.length) {
        throw new ApiException(
          'One or more user IDs do not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }
}
