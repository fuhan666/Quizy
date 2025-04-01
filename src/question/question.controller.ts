import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { RequestUserType } from 'src/auth/dto/request-user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { GenerateQuestionsDto } from './dto/generate-question.dto';
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  async getQuestion(@User() user: RequestUserType) {
    return this.questionService.getQuestions(user.id);
  }

  @Post()
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
    @User() user: RequestUserType,
  ) {
    return this.questionService.create(user.id, createQuestionDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: RequestUserType) {
    return this.questionService.delete(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @User() user: RequestUserType,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionService.update(user.id, id, dto);
  }

  @Post('generate-questions')
  async generateQuestions(
    @User() user: RequestUserType,
    @Body() dto: GenerateQuestionsDto,
  ) {
    return this.questionService.generateQuestions(user.id, dto);
  }
}
