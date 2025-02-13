import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { QuestionService } from './question.service';
import { RequestUserType } from 'src/auth/dto/request-user.type';

@Controller('question')
export class QuestionController {
  constructor(private _questionService: QuestionService) {}

  @Get()
  async getQuestion(@Req() { user }: { user: RequestUserType }) {
    return this._questionService.getQuestions(user.id);
  }

  @Post()
  async create(
    @Body('questionText') questionText: string,
    @Req() { user }: { user: RequestUserType },
  ) {
    return this._questionService.create(user.id, questionText);
  }
}
