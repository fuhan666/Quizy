import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnswerSheet } from 'src/answer-sheet/schema/answer-sheet.schema';
import { PaperStatistics } from './schema/paper-statistics.schema';
import { AnswerSheetAnswerDto } from 'src/answer-sheet/dto/answer-sheet-answer.dto';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { AnswerSheetService } from 'src/answer-sheet/answer-sheet.service';

@Injectable()
export class PaperListener {
  constructor(
    @InjectModel(PaperStatistics.name)
    private readonly paperStatisticsModel: Model<PaperStatistics>,
    @InjectModel(AnswerSheet.name)
    private readonly answerSheetModel: Model<AnswerSheet>,
    @InjectPinoLogger(PaperListener.name)
    private readonly logger: PinoLogger,
    private readonly answerSheetService: AnswerSheetService,
  ) {}

  @OnEvent('answer-sheet.submitted')
  async handleAnswerSheetSubmitted(answerSheetId: Types.ObjectId) {
    try {
      const answerSheet = await this.answerSheetModel.findById(
        answerSheetId,
        'paperId answers correctAnswers',
      );
      if (!answerSheet) {
        this.logger.error(
          `Answer sheet not found: ${answerSheetId.toString()}`,
        );
        return;
      }
      const { paperId, answers, correctAnswers } = answerSheet;
      if (!answers || !correctAnswers || answers.length === 0) {
        this.logger.error(
          `Answer sheet has no answers or correct answers: ${answerSheetId.toString()}`,
        );
        return;
      }

      let totalScore = 0;
      const answersMap = answers.reduce((acc, answer) => {
        acc.set(answer.order, answer);
        return acc;
      }, new Map<number, AnswerSheetAnswerDto>());

      for (const correctAnswer of correctAnswers) {
        if (!answersMap.has(correctAnswer.order)) continue;
        // Find or create statistics record
        let statisticsRecord = await this.paperStatisticsModel.findOne({
          paperId,
          questionId: correctAnswer.questionId,
        });
        if (!statisticsRecord) {
          statisticsRecord = new this.paperStatisticsModel({
            paperId,
            questionId: correctAnswer.questionId,
            totalAttempts: 0,
            correctAttempts: 0,
          });
        }

        statisticsRecord.totalAttempts += 1;

        const answer = answersMap.get(correctAnswer.order);
        if (this.answerSheetService.isAnswerCorrect(answer, correctAnswer)) {
          totalScore += correctAnswer.score;
          statisticsRecord.correctAttempts += 1;
        }

        await statisticsRecord.save();
      }
      answerSheet.score = totalScore;
      await answerSheet.save();
    } catch (error) {
      this.logger.error(`Handle answer sheet submitted error: ${error}`);
    }
  }
}
