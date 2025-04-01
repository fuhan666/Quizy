import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CloudflareOssService } from 'src/shared/oss/cloudflare/cloudflare-oss.service';
@Injectable()
export class FileService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cloudflareOssService: CloudflareOssService,
  ) {}

  findAll(userId: number) {
    return this.prismaService.uploadFileEntity.findMany({
      where: { user: { id: userId } },
      omit: { file: true },
      orderBy: { id: 'desc' },
    });
  }

  async remove(userId: number, id: number) {
    const { file } = await this.prismaService.uploadFileEntity.delete({
      where: { id, user: { id: userId } },
    });
    await this.cloudflareOssService.delete(file);
  }

  async uploadPdf(userId: number, file: Express.Multer.File) {
    const ext = file.originalname.split('.').pop();
    const key = `pdfs/${userId}/${uuidv4()}.${ext}`;
    await this.cloudflareOssService.upload(key, file.buffer, file.mimetype);
    const data: Prisma.UploadFileEntityCreateInput = {
      user: { connect: { id: userId } },
      file: key,
      fileName: file.originalname,
      fileType: file.mimetype,
    };
    return this.prismaService.uploadFileEntity.create({ data });
  }
}
