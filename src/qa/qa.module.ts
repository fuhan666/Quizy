import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AnswerService } from './answer.service';
import { AnswerController } from './answer.controller';

@Module({
  imports: [PrismaModule],
  providers: [QuestionService, AnswerService],
  exports: [QuestionService, AnswerService],
  controllers: [QuestionController, AnswerController],
})
export class QAModule {}
