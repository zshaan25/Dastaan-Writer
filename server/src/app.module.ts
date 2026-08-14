import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { ConversationsModule } from './conversations/conversations.module';
import { PostsModule } from './posts/posts.module';
import { LinkedinModule } from './linkedin/linkedin.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('FATAL ERROR: MONGODB_URI environment variable is missing!');
        }
        return {
          uri,
        };
      },
    }),
    HealthModule,
    UsersModule,
    AuthModule,
    AiModule,
    ConversationsModule,
    PostsModule,
    LinkedinModule,
    EmailModule,
  ],
})
export class AppModule {}
