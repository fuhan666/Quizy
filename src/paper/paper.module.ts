import { Module } from '@nestjs/common';
import { PaperService } from './paper.service';
import { PaperController } from './paper.controller';
import { QuestionModule } from 'src/question/question.module';
import { AnswerSheetModule } from 'src/answer-sheet/answer-sheet.module';
import { Paper, PaperSchema } from './schema/paper.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchema } from 'src/question/schema/question.schema';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PaperListener } from './paper.listener';
import {
  PaperStatistics,
  PaperStatisticsSchema,
} from './schema/paper-statistics.schema';
import {
  AnswerSheet,
  AnswerSheetSchema,
} from 'src/answer-sheet/schema/answer-sheet.schema';

@Module({
  imports: [
    QuestionModule,
    AnswerSheetModule,
    EventEmitterModule.forRoot(),
    MongooseModule.forFeature([
      { name: Paper.name, schema: PaperSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: PaperStatistics.name, schema: PaperStatisticsSchema },
      { name: AnswerSheet.name, schema: AnswerSheetSchema },
    ]),
  ],
  controllers: [PaperController],
  providers: [PaperService, PaperListener],
  exports: [PaperService],
})
export class PaperModule {}
