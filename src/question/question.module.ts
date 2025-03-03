import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from './schema/question.schema';
import { Paper, PaperSchema } from 'src/paper/schema/paper.schema';
import { OssModule } from 'src/shared/oss/oss.module';

@Module({
  imports: [
    OssModule,
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Paper.name, schema: PaperSchema },
    ]),
  ],
  providers: [QuestionService],
  exports: [QuestionService],
  controllers: [QuestionController],
})
export class QuestionModule {}
