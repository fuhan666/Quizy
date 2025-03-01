import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { FindUserDto } from './dto/find-user.dto';
import { RequestUserType } from 'src/auth/dto/request-user.dto';
import { User } from 'src/common/decorators/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @SkipAuth()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this._userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() dto: FindUserDto) {
    return this._userService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this._userService.findOne(id);
  }

  @Patch(':id')
  update(
    @User() user: RequestUserType,
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this._userService.update(user, id, updateUserDto);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @User() user: RequestUserType,
    @Param('id') id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    avatar: Express.Multer.File,
  ) {
    return this._userService.uploadAvatar(user, id, avatar);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this._userService.remove(id);
  }
}
