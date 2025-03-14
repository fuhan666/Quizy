import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CloudflareR2Config } from './cloudflare-oss.config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class CloudflareOssService {
  private readonly s3Client: S3Client;
  private readonly config: CloudflareR2Config;

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    const config = this.configService.get<CloudflareR2Config>('cloudflareR2');
    if (!config) {
      throw new Error('Cloudflare R2 configuration is missing');
    }
    this.config = config;
    this.s3Client = new S3Client({
      region: this.config.region,
      endpoint: `https://${this.config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async upload(key: string, body: Buffer, contentType: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      return key;
    } catch {
      throw new Error(`Cloudflare put object failed: ${key}`);
    }
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const cacheKey = `cloudflare-signed-url:${key}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as string;
    }
    const command = new GetObjectCommand({
      Bucket: this.config.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn });
    await this.cacheManager.set(cacheKey, url, expiresIn * 1000);
    return url;
  }
}
