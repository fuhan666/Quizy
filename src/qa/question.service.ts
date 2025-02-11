import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private _prisma: PrismaService) {}

  public async getQuestions() {
    return this._prisma.questionEntity.findMany();
  }
}
