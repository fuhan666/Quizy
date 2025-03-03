import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcrypt';
import { FindUserDto } from './dto/find-user.dto';
import { RequestUserType } from 'src/auth/dto/request-user.dto';
import { CloudflareOssService } from 'src/shared/oss/cloudflare/cloudflare-oss.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private _prisma: PrismaService,
    private _ossService: CloudflareOssService,
  ) {}

  private async _hashPassword(password: string) {
    const salt = await bcrypt.genSalt();
    const hashed = bcrypt.hash(password, salt);
    return hashed;
  }

  public async comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  public async create({ userName, password }: CreateUserDto) {
    try {
      password = await this._hashPassword(password);
      const data: Prisma.UserEntityCreateInput = { userName, password };
      const { id } = await this._prisma.userEntity.create({ data });
      return { id };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  findAll(dto: FindUserDto) {
    const where: Prisma.UserEntityWhereInput = {};
    if (dto?.userName) where.userName = dto.userName;
    if (dto?.nickName) where.nickName = dto.nickName;
    return this._prisma.userEntity.findMany({
      where,
      select: { id: true, userName: true, nickName: true },
      orderBy: { id: 'asc' },
    });
  }

  findOne(id: number) {
    return this._prisma.userEntity.findUniqueOrThrow({
      where: { id },
      select: {
        userName: true,
        nickName: true,
        avatar: true,
      },
    });
  }

  findOneByUserName(userName: string) {
    const where: Prisma.UserEntityWhereInput = { userName };
    return this._prisma.userEntity.findFirst({ where });
  }

  public async uploadAvatar(
    user: RequestUserType,
    id: number,
    file: Express.Multer.File,
  ) {
    if (user.id !== id) {
      throw new ForbiddenException(
        'You can only upload avatar for the currently logged in user',
      );
    }

    const currentUser = await this._prisma.userEntity.findUnique({
      where: { id },
      select: { avatar: true },
    });

    if (currentUser?.avatar) {
      try {
        await this._ossService.delete(currentUser.avatar);
      } catch (error) {
        console.warn('Failed to delete old avatar:', error);
      }
    }

    const ext = file.originalname.split('.').pop();
    const key = `avatars/${id}/${uuidv4()}.${ext}`;
    await this._ossService.upload(key, file.buffer, file.mimetype);

    const data: Prisma.UserEntityUpdateInput = { avatar: key };
    await this._prisma.userEntity.update({ where: { id }, data });
    return data;
  }

  public async update(
    user: RequestUserType,
    id: number,
    { nickName, password }: UpdateUserDto,
  ) {
    if (user.id !== id) {
      throw new ForbiddenException(
        'You can only update the currently logged in user',
      );
    }
    const data: Prisma.UserEntityUpdateInput = {};
    if (nickName) data.nickName = nickName;
    if (password) {
      password = await this._hashPassword(password);
      data.password = password;
    }
    return this._prisma.userEntity.update({ where: { id }, data });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
