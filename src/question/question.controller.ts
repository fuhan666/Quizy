import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { QuestionService } from './question.service';

@Controller('question')
export class QuestionController {
  constructor(private _questionService: QuestionService) {}

  @Get()
  async getQuestion(@Request() req) {
    return this._questionService.getQuestions(req.user.id);
  }

  @Post()
  async create(@Body('questionText') questionText: string, @Request() req) {
    return this._questionService.create(req.user.id, questionText);
  }
}
