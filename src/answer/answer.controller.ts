import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { RequestUserType } from 'src/auth/dto/request-user.dto';
import { User } from 'src/common/decorators/user.decorator';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  create(@User() user: RequestUserType, @Body() dto: CreateAnswerDto) {
    return this.answerService.create(user.id, dto);
  }

  @Get()
  findAll(@User() user: RequestUserType) {
    return this.answerService.findAll(user.id);
  }

  @Get(':id')
  findOne(@User() user: RequestUserType, @Param('id') id: number) {
    return this.answerService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @User() user: RequestUserType,
    @Param('id') id: number,
    @Body() dto: UpdateAnswerDto,
  ) {
    return this.answerService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@User() user: RequestUserType, @Param('id') id: number) {
    return this.answerService.remove(user.id, id);
  }
}
