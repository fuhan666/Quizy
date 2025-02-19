import { Module } from '@nestjs/common';
import { PaperService } from './paper.service';
import { PaperController } from './paper.controller';
import { QuestionModule } from 'src/question/question.module';
import { AnswerSheetModule } from 'src/answer-sheet/answer-sheet.module';
import { Paper, PaperSchema } from './schema/paper.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from 'src/question/schema/question.schema';
@Module({
  imports: [
    QuestionModule,
    AnswerSheetModule,
    MongooseModule.forFeature([
      { name: Paper.name, schema: PaperSchema },
      { name: Question.name, schema: QuestionSchema },
    ]),
  ],
  controllers: [PaperController],
  providers: [PaperService],
  exports: [PaperService],
})
export class PaperModule {}
