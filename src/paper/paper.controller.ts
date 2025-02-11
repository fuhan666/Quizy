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

@Controller('paper')
export class PaperController {
  constructor(private readonly papersService: PaperService) {}

  @Post()
  create(@Body() createPaperDto: CreatePaperDto) {
    return this.papersService.create(createPaperDto);
  }

  @Get()
  findAll() {
    return this.papersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.papersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaperDto: UpdatePaperDto) {
    return this.papersService.update(+id, updatePaperDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.papersService.remove(+id);
  }
}
