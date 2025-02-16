import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AnswerSheetService } from './answer-sheet.service';
import { UpdateAnswerSheetDto } from './dto/update-answer-sheet.dto';
import { User } from 'src/common/decorators/user.decorator';
import { RequestUserType } from 'src/auth/dto/request-user.dto';

@Controller('answer-sheet')
export class AnswerSheetController {
  constructor(private readonly answerSheetService: AnswerSheetService) {}

  @Get()
  findAll() {
    return this.answerSheetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answerSheetService.findOne(+id);
  }

  @Patch(':id')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  update(
    @User() user: RequestUserType,
    @Param('id') id: number,
    @Body() dto: UpdateAnswerSheetDto,
  ) {
    return this.answerSheetService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answerSheetService.remove(+id);
  }
}
