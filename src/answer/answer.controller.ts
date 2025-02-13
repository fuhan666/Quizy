import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { AnswerService } from './answer.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { RequestUserType } from 'src/auth/dto/request-user.type';

@Controller('answer')
export class AnswerController {
  constructor(private readonly answerService: AnswerService) {}

  @Post()
  create(
    @Req() { user }: { user: RequestUserType },
    @Body() dto: CreateAnswerDto,
  ) {
    return this.answerService.create(user.id, dto);
  }

  @Get()
  findAll(@Req() { user }: { user: RequestUserType }) {
    return this.answerService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Req() { user }: { user: RequestUserType }, @Param('id') id: string) {
    return this.answerService.findOne(user.id, +id);
  }

  @Patch(':id')
  update(
    @Req() { user }: { user: RequestUserType },
    @Param('id') id: string,
    @Body() dto: UpdateAnswerDto,
  ) {
    return this.answerService.update(user.id, +id, dto);
  }

  @Delete(':id')
  remove(@Req() { user }: { user: RequestUserType }, @Param('id') id: string) {
    return this.answerService.remove(user.id, +id);
  }
}
