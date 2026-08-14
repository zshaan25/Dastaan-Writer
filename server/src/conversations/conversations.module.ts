import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { ConversationsService } from './conversations.service';
import { DastaanConversationAiService } from './dastaan-conversation-ai.service';
import { ConversationsController } from './conversations.controller';
import { UsersModule } from '../users/users.module';
import { AiModule } from '../ai/ai.module';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }]),
    UsersModule,
    AiModule,
    forwardRef(() => PostsModule),
  ],
  providers: [ConversationsService, DastaanConversationAiService],
  controllers: [ConversationsController],
  exports: [ConversationsService],
})
export class ConversationsModule {}
