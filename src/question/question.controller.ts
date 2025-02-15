import { Body, Controller, Get, Post } from '@nestjs/common';
import { QuestionService } from './question.service';
import { RequestUserType } from 'src/auth/dto/request-user.dto';
import { User } from 'src/common/decorators/user.decorator';

@Controller('question')
export class QuestionController {
  constructor(private _questionService: QuestionService) {}

  @Get()
  async getQuestion(@User() user: RequestUserType) {
    return this._questionService.getQuestions(user.id);
  }

  @Post()
  async create(
    @Body('questionText') questionText: string,
    @User() user: RequestUserType,
  ) {
    return this._questionService.create(user.id, questionText);
  }
}
