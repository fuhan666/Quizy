import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private _prisma: PrismaService) {}

  public async getQuestions(userId: number) {
    return this._prisma.questionEntity.findMany({ where: { userId } });
  }

  create(userId: number, questionText: string) {
    const data: Prisma.QuestionEntityCreateInput = {
      questionText,
      user: { connect: { id: userId } },
    };
    return this._prisma.questionEntity.create({ data });
  }
}
