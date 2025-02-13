import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';

@Module({
  providers: [QuestionService],
  exports: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
