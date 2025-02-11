import { Module } from '@nestjs/common';
import { PaperService } from './paper.service';
import { PaperController } from './paper.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QAModule } from 'src/qa/qa.module';

@Module({
  imports: [PrismaModule, QAModule],
  controllers: [PaperController],
  providers: [PaperService],
  exports: [PaperService],
})
export class PaperModule {}
