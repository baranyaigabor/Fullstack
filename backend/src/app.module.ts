import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller.js';
import { createAuth } from './auth/auth.js';
import { CacheModule } from './cache/cache.module.js';
import { validateEnvironment } from './config/environment.js';
import { DatabaseModule } from './database/database.module.js';
import { DatabaseService } from './database/database.service.js';
import { MailModule } from './mail/mail.module.js';
import { MailService } from './mail/mail.service.js';
import { PaymentModule } from './payment/payment.module.js';
import { ProfileImageModule } from './profile-image/profile-image.module.js';
import { QueueModule } from './queue/queue.module.js';
import { RateLimitModule } from './rate-limit/rate-limit.module.js';
import { SearchModule } from './search/search.module.js';
import { StorageModule } from './storage/storage.module.js';
import { UserModule } from './user/user.module.js';
import { VirusScannerModule } from './virusscanner/virusscanner.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      validate: validateEnvironment,
    }),
    DatabaseModule,
    MailModule,
    AuthModule.forRootAsync({
      imports: [DatabaseModule, MailModule],
      inject: [DatabaseService, MailService],
      useFactory: (
        databaseService: DatabaseService,
        mailService: MailService,
      ) => ({
        auth: createAuth(databaseService, mailService),
        bodyParser: {
          json: { limit: '2mb' },
          urlencoded: { limit: '2mb', extended: true },
          rawBody: true,
        },
      }),
    }),
    CacheModule,
    QueueModule,
    RateLimitModule,
    SearchModule,
    VirusScannerModule,
    StorageModule,
    ProfileImageModule,
    UserModule,
    PaymentModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
