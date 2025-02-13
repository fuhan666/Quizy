import { Module } from '@nestjs/common';
import { PaperService } from './paper.service';
import { PaperController } from './paper.controller';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [QuestionModule],
  controllers: [PaperController],
  providers: [PaperService],
  exports: [PaperService],
})
export class PaperModule {}
