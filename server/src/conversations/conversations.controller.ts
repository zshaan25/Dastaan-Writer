import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Conversations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Start a new conversation thread',
    description: 'Initializes a new context-gathering conversation session for creating a LinkedIn post.',
  })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully.',
    schema: {
      example: {
        conversationId: '64f1a2b3c4d5e6f7a8b9c0d1',
        status: 'COLLECTING_CONTEXT',
        title: 'New Dastaan Post',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async create(@Request() req: any, @Body() createDto: CreateConversationDto) {
    const userId = req.user.id || req.user._id || req.user.userId;
    const conversation = await this.conversationsService.createConversation(userId, createDto);
    return {
      conversationId: conversation._id,
      status: conversation.status,
      title: conversation.title,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'List user conversation threads',
    description: 'Retrieves all conversation history threads for the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of conversations.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async findAll(@Request() req: any) {
    const userId = req.user.id || req.user._id || req.user.userId;
    return this.conversationsService.getUserConversations(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get conversation thread by ID',
    description: 'Retrieves detailed conversation messages, collected context, and linked post reference.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the conversation' })
  @ApiResponse({ status: 200, description: 'Conversation details returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id || req.user._id || req.user.userId;
    return this.conversationsService.getConversationById(userId, id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete conversation thread',
    description: 'Deletes a conversation history thread by ID.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async remove(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id || req.user._id || req.user.userId;
    return this.conversationsService.deleteConversation(userId, id);
  }

  @Post(':id/messages')
  @ApiOperation({
    summary: 'Send message to assistant',
    description: 'Sends a user message to Dastaan AI, which extracts context, asks follow-ups, or generates the canonical post.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the conversation' })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 200, description: 'Message processed and updated conversation state returned.' })
  @ApiResponse({ status: 400, description: 'Invalid message payload.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  async sendMessage(@Request() req: any, @Param('id') id: string, @Body() sendDto: SendMessageDto) {
    const userId = req.user.id || req.user._id || req.user.userId;
    return this.conversationsService.processMessage(userId, id, sendDto);
  }
}
