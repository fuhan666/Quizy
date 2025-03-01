import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudflareOssService } from './cloudflare/cloudflare-oss.service';
import cloudflareR2Config from './cloudflare/cloudflare-oss.config';

@Module({
  imports: [ConfigModule.forFeature(cloudflareR2Config)],
  providers: [CloudflareOssService],
  exports: [CloudflareOssService],
})
export class OssModule {}
