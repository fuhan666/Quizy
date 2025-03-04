import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuestionModule } from './question/question.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PaperModule } from './paper/paper.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AnswerSheetModule } from './answer-sheet/answer-sheet.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'production')
          .default('development'),
        PORT: Joi.number().default(7849),
        JWT_SECRET: Joi.string(),
        DATABASE_URL: Joi.string(),
        MONGODB_URI: Joi.string(),
        CLOUDFLARE_REGION: Joi.string().default('auto'),
        CLOUDFLARE_ACCOUNT_ID: Joi.string(),
        CLOUDFLARE_ACCESS_KEY_ID: Joi.string(),
        CLOUDFLARE_SECRET_ACCESS_KEY: Joi.string(),
        CLOUDFLARE_R2_BUCKET: Joi.string(),
      }),
    }),
    QuestionModule,
    UserModule,
    PaperModule,
    AuthModule,
    PrismaModule,
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AnswerSheetModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
