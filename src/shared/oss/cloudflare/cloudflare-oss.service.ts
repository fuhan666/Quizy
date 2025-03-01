import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CloudflareR2Config } from './cloudflare-oss.config';

@Injectable()
export class CloudflareOssService {
  private readonly _s3Client: S3Client;
  private readonly _config: CloudflareR2Config;

  constructor(private _configService: ConfigService) {
    const config = this._configService.get<CloudflareR2Config>('cloudflareR2');
    if (!config) {
      throw new Error('Cloudflare R2 configuration is missing');
    }
    this._config = config;
    this._s3Client = new S3Client({
      region: this._config.region,
      endpoint: `https://${this._config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this._config.accessKeyId,
        secretAccessKey: this._config.secretAccessKey,
      },
    });
  }

  async upload(key: string, body: Buffer, contentType: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: this._config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this._s3Client.send(command);
      return key;
    } catch {
      throw Error(`Cloudflare put object failed: ${key}`);
    }
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this._config.bucket,
      Key: key,
    });

    await this._s3Client.send(command);
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this._config.bucket,
      Key: key,
    });

    return await getSignedUrl(this._s3Client, command, { expiresIn });
  }
}
