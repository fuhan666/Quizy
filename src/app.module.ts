import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QAModule } from './qa/qa.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PaperModule } from './paper/paper.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    QAModule,
    UserModule,
    PaperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
