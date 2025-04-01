import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { OssModule } from 'src/shared/oss/oss.module';

@Module({
  imports: [OssModule],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
