import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { RequestUserType } from 'src/auth/dto/request-user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('question')
export class QuestionController {
  constructor(private _questionService: QuestionService) {}

  @Get()
  async getQuestion(@User() user: RequestUserType) {
    return this._questionService.getQuestions(user.id);
  }

  @Post()
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
    @User() user: RequestUserType,
  ) {
    return this._questionService.create(user.id, createQuestionDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @User() user: RequestUserType) {
    return this._questionService.delete(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @User() user: RequestUserType,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this._questionService.update(user.id, id, dto);
  }

  @Post('upload-pdf')
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
    return this._questionService.uploadPdf(user.id, pdfFile);
  }
}
