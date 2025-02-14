import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PaperService } from './paper.service';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { RequestUserType } from 'src/auth/dto/request-user.type';
import { User } from 'src/common/decorators/user.decorator';

@Controller('paper')
export class PaperController {
  constructor(private readonly papersService: PaperService) {}

  @Post()
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
  findOne(@User() user: RequestUserType, @Param('id') id: string) {
    return this.papersService.findOne(user.id, +id);
  }

  @Patch(':id')
  update(
    @User() user: RequestUserType,
    @Param('id') id: string,
    @Body() updatePaperDto: UpdatePaperDto,
  ) {
    return this.papersService.update(user.id, +id, updatePaperDto);
  }

  @Delete(':id')
  remove(@User() user: RequestUserType, @Param('id') id: string) {
    return this.papersService.remove(user.id, +id);
  }
}
