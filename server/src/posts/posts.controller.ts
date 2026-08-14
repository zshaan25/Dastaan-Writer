import {
  Controller,
  Get,
  Post as HttpPost,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from './posts.service';
import { GeneratePostDto } from './dto/generate-post.dto';
import { RefinePostDto } from './dto/refine-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('Posts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  private getUserId(req: any): string {
    return req.user.id || req.user._id || req.user.userId;
  }

  @HttpPost('generate')
  @ApiOperation({
    summary: 'Generate structured post',
    description: 'Generates or retrieves the canonical structured post based on conversation history and profile context.',
  })
  @ApiBody({ type: GeneratePostDto })
  @ApiResponse({ status: 201, description: 'Post generated or existing canonical post returned.' })
  @ApiResponse({ status: 400, description: 'Invalid generation parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'User or conversation context not found.' })
  async generatePost(@Request() req: any, @Body() dto: GeneratePostDto) {
    return this.postsService.generatePost(this.getUserId(req), dto);
  }

  @HttpPost('refine')
  @ApiOperation({
    summary: 'Refine working post',
    description: 'Applies AI transformations (improve hook, make personal, technical, shorter, etc.) to the current working draft.',
  })
  @ApiBody({ type: RefinePostDto })
  @ApiResponse({ status: 200, description: 'Post refined successfully in-place.' })
  @ApiResponse({ status: 400, description: 'Invalid refinement parameters.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async refinePost(@Request() req: any, @Body() dto: RefinePostDto) {
    return this.postsService.refinePost(this.getUserId(req), dto);
  }

  @HttpPost('alternatives')
  @ApiOperation({
    summary: 'Generate 3 alternative versions',
    description: 'Generates 3 distinct tonal variations (Professional, Personal, Storytelling) stored under post.versions.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { postId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' } },
      required: ['postId'],
    },
  })
  @ApiResponse({ status: 200, description: 'Alternative versions generated and added to post.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async generateAlternatives(@Request() req: any, @Body('postId') postId: string) {
    return this.postsService.generateAlternatives(this.getUserId(req), postId);
  }

  @Get()
  @ApiOperation({
    summary: 'List user posts',
    description: 'Retrieves all posts created by the authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'List of posts returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async getPosts(@Request() req: any) {
    return this.postsService.getPosts(this.getUserId(req));
  }

  @Get('conversation/:conversationId')
  @ApiOperation({
    summary: 'Get canonical post by conversation ID',
    description: 'Retrieves the canonical post attached to a specific conversation thread.',
  })
  @ApiParam({ name: 'conversationId', description: 'MongoDB ObjectId of the conversation' })
  @ApiResponse({ status: 200, description: 'Post returned or null if none created yet.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async getPostByConversation(@Request() req: any, @Param('conversationId') conversationId: string) {
    return this.postsService.getPostByConversationId(this.getUserId(req), conversationId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get post by ID',
    description: 'Retrieves a single post document by ID.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the post' })
  @ApiResponse({ status: 200, description: 'Post document returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 403, description: 'Access denied: You do not own this post.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async getPostById(@Request() req: any, @Param('id') id: string) {
    return this.postsService.getPostById(this.getUserId(req), id);
  }

  @HttpPost(':id/approve')
  @ApiOperation({
    summary: 'Approve post',
    description: 'Marks the post status as APPROVED.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the post' })
  @ApiResponse({ status: 200, description: 'Post marked as APPROVED.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async approvePost(@Request() req: any, @Param('id') id: string) {
    return this.postsService.approvePost(this.getUserId(req), id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update post manual edits',
    description: 'Saves user manual edits to hook, body, cta, hashtags, mentions, or status.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the post' })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, description: 'Post updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async updatePost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(this.getUserId(req), id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete post',
    description: 'Deletes a post by ID.',
  })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId of the post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  async deletePost(@Request() req: any, @Param('id') id: string) {
    return this.postsService.deletePost(this.getUserId(req), id);
  }
}
