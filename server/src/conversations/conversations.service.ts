import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument, ConversationStatus } from './schemas/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UsersService } from '../users/users.service';
import { DastaanConversationAiService } from './dastaan-conversation-ai.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    private readonly usersService: UsersService,
    private readonly aiService: DastaanConversationAiService,
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
  ) {}

  async createConversation(userId: string, createDto: CreateConversationDto): Promise<ConversationDocument> {
    const newConv = new this.conversationModel({
      userId: new Types.ObjectId(userId),
      title: createDto.title || 'New Dastaan Post',
      platform: createDto.platform || 'LINKEDIN',
      postType: createDto.postType || 'ACHIEVEMENT',
      status: ConversationStatus.COLLECTING_CONTEXT,
      messages: [],
      collectedContext: {},
    });

    return newConv.save();
  }

  async getUserConversations(userId: string): Promise<ConversationDocument[]> {
    return this.conversationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getConversationById(userId: string, conversationId: string): Promise<ConversationDocument> {
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new BadRequestException('Invalid conversation ID format');
    }

    const conversation = await this.conversationModel.findById(conversationId).exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.userId.toString() !== userId) {
      throw new ForbiddenException('Access denied: You do not own this conversation');
    }

    return conversation;
  }

  async updateStatus(userId: string, conversationId: string, status: ConversationStatus): Promise<ConversationDocument> {
    const conversation = await this.getConversationById(userId, conversationId);
    conversation.status = status;
    return conversation.save();
  }

  async updateConversation(userId: string, conversationId: string, updateDto: { title?: string }): Promise<ConversationDocument> {
    const conversation = await this.getConversationById(userId, conversationId);
    if (updateDto.title !== undefined) {
      conversation.title = updateDto.title.trim();
    }
    return conversation.save();
  }

  async deleteConversation(userId: string, conversationId: string): Promise<{ success: boolean }> {
    const conversation = await this.getConversationById(userId, conversationId);
    await this.conversationModel.deleteOne({ _id: conversation._id }).exec();
    return { success: true };
  }

  async processMessage(userId: string, conversationId: string, sendDto: SendMessageDto): Promise<ConversationDocument> {
    const conversation = await this.getConversationById(userId, conversationId);

    // Fetch User Profile for context-aware prompting
    let userProfile = null;
    try {
      userProfile = await this.usersService.findById(userId);
    } catch (err) {
      this.logger.warn(`Could not load user profile for userId=${userId}: ${err.message}`);
    }

    // Append User Message to conversation history
    conversation.messages.push({
      role: 'user',
      content: sendDto.message.trim(),
      timestamp: new Date(),
    });

    // Delegate context assembly & AI decision to DastaanConversationAiService
    const aiDecision = await this.aiService.evaluateConversation(conversation, userProfile, sendDto.message.trim());

    // Merge collectedContext safely without overwriting previous turn data
    if (aiDecision.collectedContext && typeof aiDecision.collectedContext === 'object') {
      conversation.collectedContext = {
        ...conversation.collectedContext,
        ...aiDecision.collectedContext,
      };
    }

    if (aiDecision.intent) {
      conversation.intent = aiDecision.intent;
    }

    if (aiDecision.postType) {
      conversation.postType = aiDecision.postType;
    }

    let generatedPostId: Types.ObjectId | undefined = conversation.postId;

    // Handle GENERATE_DRAFT action: Create or update the single canonical Post document
    if (aiDecision.action === 'GENERATE_DRAFT') {
      conversation.status = ConversationStatus.DRAFT_GENERATED;

      try {
        const historyText = conversation.messages
          .slice(-10)
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join('\n');

        const contextText = conversation.collectedContext
          ? `Collected Context: ${JSON.stringify(conversation.collectedContext)}`
          : '';

        const fullContext = `${contextText}\n\nConversation History:\n${historyText}`;

        const postDoc = await this.postsService.generatePostForConversation(
          userId,
          conversation._id.toString(),
          fullContext,
          userProfile,
          conversation.postType,
          userProfile?.preferredTone,
        );

        generatedPostId = postDoc._id as Types.ObjectId;
        conversation.postId = generatedPostId;
      } catch (err: any) {
        this.logger.error(`Error generating canonical post for conversation ${conversationId}: ${err.message}`);
      }
    } else if (Object.keys(conversation.collectedContext || {}).length >= 3) {
      conversation.status = ConversationStatus.READY_FOR_DRAFT;
    } else {
      conversation.status = ConversationStatus.COLLECTING_CONTEXT;
    }

    // Append Assistant Response to conversation history
    conversation.messages.push({
      role: 'assistant',
      content: aiDecision.message,
      timestamp: new Date(),
      action: aiDecision.action,
      postId: generatedPostId,
    });

    // Auto-update conversation title if still default
    if (conversation.title === 'New Dastaan Post' && sendDto.message.length > 5) {
      const summary = sendDto.message.substring(0, 30);
      conversation.title = summary.length < sendDto.message.length ? `${summary}...` : summary;
    }

    return conversation.save();
  }
}
