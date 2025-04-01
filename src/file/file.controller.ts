import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileService } from './file.service';
import { RequestUserType } from 'src/auth/dto/request-user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('pdf')
  @UseInterceptors(FileInterceptor('pdfFile'))
  async uploadPdf(
    @User() user: RequestUserType,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 15 }), // 15MB
          new FileTypeValidator({ fileType: /pdf$/ }),
        ],
      }),
    )
    pdfFile: Express.Multer.File,
  ) {
    return this.fileService.uploadPdf(user.id, pdfFile);
  }

  @Get()
  findAll(@User() user: RequestUserType) {
    return this.fileService.findAll(user.id);
  }

  @Delete(':id')
  remove(@User() user: RequestUserType, @Param('id') id: number) {
    return this.fileService.remove(user.id, id);
  }
}
