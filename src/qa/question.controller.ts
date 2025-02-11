import { Controller, Get } from '@nestjs/common';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private _questionService: QuestionService) {}

  @Get('list')
  async getQuestion() {
    return this._questionService.getQuestions();
  }
}
