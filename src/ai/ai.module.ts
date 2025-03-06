import { Module } from '@nestjs/common';
import { DifyService } from './dify/dify.service';
@Module({
  providers: [DifyService],
  exports: [DifyService],
})
export class AiModule {}
