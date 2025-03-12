import { Module } from '@nestjs/common';
import { AnswerSheetService } from './answer-sheet.service';
import { AnswerSheetController } from './answer-sheet.controller';
import { AnswerSheetSchema } from './schema/answer-sheet.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AnswerSheet } from './schema/answer-sheet.schema';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnswerSheet.name, schema: AnswerSheetSchema },
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AnswerSheetController],
  providers: [AnswerSheetService],
  exports: [AnswerSheetService],
})
export class AnswerSheetModule {}
