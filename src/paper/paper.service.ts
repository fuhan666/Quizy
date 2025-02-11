import { Injectable } from '@nestjs/common';
import { CreatePaperDto } from './dto/create-paper.dto';
import { UpdatePaperDto } from './dto/update-paper.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaperService {
  constructor(private _prisma: PrismaService) {}
  create(data: CreatePaperDto) {
    return;
  }

  findAll() {
    return `This action returns all papers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paper`;
  }

  update(id: number, updatePaperDto: UpdatePaperDto) {
    return `This action updates a #${id} paper`;
  }

  remove(id: number) {
    return `This action removes a #${id} paper`;
  }
}
