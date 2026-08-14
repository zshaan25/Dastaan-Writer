import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostGeneratorAiService } from './post-generator-ai.service';
import { UsersModule } from '../users/users.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    UsersModule,
    forwardRef(() => ConversationsModule),
    AiModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostGeneratorAiService],
  exports: [PostsService, PostGeneratorAiService],
})
export class PostsModule {}
