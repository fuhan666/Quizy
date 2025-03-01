import { registerAs } from '@nestjs/config';

export interface CloudflareR2Config {
  region: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

export default registerAs('cloudflareR2', () => ({
  region: process.env.CLOUDFLARE_REGION || 'auto',
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucket: process.env.CLOUDFLARE_R2_BUCKET,
}));
