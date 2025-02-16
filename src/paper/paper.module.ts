import { Module } from '@nestjs/common';
import { PaperService } from './paper.service';
import { PaperController } from './paper.controller';
import { QuestionModule } from 'src/question/question.module';
import { AnswerSheetModule } from 'src/answer-sheet/answer-sheet.module';

@Module({
  imports: [QuestionModule, AnswerSheetModule],
  controllers: [PaperController],
  providers: [PaperService],
  exports: [PaperService],
})
export class PaperModule {}
