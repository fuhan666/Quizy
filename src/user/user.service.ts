import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { FindUserDto } from './dto/find-user.dto';

@Injectable()
export class UserService {
  constructor(private _prisma: PrismaService) {}

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
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return 'Username already exists';
      }
      return;
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
    return this._prisma.userEntity.findUnique({
      where: { id },
      select: {
        userName: true,
        nickName: true,
      },
    });
  }

  findOneByUserName(userName: string) {
    const where: Prisma.UserEntityWhereInput = { userName };
    return this._prisma.userEntity.findFirst({ where });
  }

  public async update(id: number, { nickName, password }: UpdateUserDto) {
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
