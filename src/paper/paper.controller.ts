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
import { PaperService } from './paper.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { RequestUserType } from 'src/auth/dto/request-user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { Types } from 'mongoose';

@Controller('paper')
export class PaperController {
  constructor(private readonly papersService: PaperService) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  create(
    @User() user: RequestUserType,
    @Body() createPaperDto: CreatePaperDto,
  ) {
    return this.papersService.create(user.id, createPaperDto);
  }

  @Get()
  findAll(@User() user: RequestUserType) {
    return this.papersService.findAll(user.id);
  }

  @Get(':id')
  findOne(@User() user: RequestUserType, @Param('id') id: Types.ObjectId) {
    return this.papersService.findOne(user.id, id);
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
    @Param('id') id: Types.ObjectId,
    @Body() updatePaperDto: UpdatePaperDto,
  ) {
    return this.papersService.update(user.id, id, updatePaperDto);
  }

  @Delete(':id')
  remove(@User() user: RequestUserType, @Param('id') id: Types.ObjectId) {
    return this.papersService.remove(user.id, id);
  }

  @Post(':id/take')
  take(@User() user: RequestUserType, @Param('id') id: Types.ObjectId) {
    return this.papersService.take(user.id, id);
  }

  @Get(':id/stats')
  async getPaperQuestionStats(
    @User() user: RequestUserType,
    @Param('id') id: Types.ObjectId,
  ) {
    return this.papersService.getPaperQuestionStats(user.id, id);
  }
}
