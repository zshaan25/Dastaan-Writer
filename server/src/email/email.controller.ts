import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from './email.service';
import { SendTestEmailDto } from './dto/send-test-email.dto';
import { SendPostEmailDto } from './dto/send-post-email.dto';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';

@ApiTags('Email')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  private getUserId(req: any): string {
    return req.user.id || req.user._id || req.user.userId;
  }

  @Post('test')
  @ApiOperation({
    summary: 'Send test connectivity email',
    description: 'Verifies Resend API credentials and connectivity by sending a test email to the specified recipient.',
  })
  @ApiBody({ type: SendTestEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Test email sent successfully.',
    schema: {
      example: {
        success: true,
        message: 'Test email sent successfully to delivered@resend.dev',
        data: { id: '01234567-89ab-cdef-0123-456789abcdef' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Email address validation error or Resend API rejection.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    return this.emailService.sendTestEmail(dto.to);
  }

  @Post('send-post')
  @ApiOperation({
    summary: 'Send post to user registered email',
    description: 'Renders and delivers a formatted preview of a saved post to the authenticated user registered email.',
  })
  @ApiBody({ type: SendPostEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Post email dispatched successfully to the user registered email address.',
    schema: {
      example: {
        success: true,
        message: 'Post sent to your registered email (user@example.com)',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid post ID or delivery failure.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'User profile or post not found.' })
  async sendPostEmail(@Request() req: any, @Body() dto: SendPostEmailDto) {
    const userId = this.getUserId(req);
    const user = await this.usersService.findById(userId);

    if (!user || !user.email) {
      throw new NotFoundException('Authenticated user email not found');
    }

    const post = await this.postsService.getPostById(userId, dto.postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.emailService.sendPostReadyEmail({
      to: user.email,
      userName: user.name,
      postType: post.postType,
      tone: post.tone,
      hook: post.hook,
      body: post.body,
      cta: post.cta,
      hashtags: post.hashtags,
      mentions: post.mentions,
    });

    return {
      success: true,
      message: `Post sent to your registered email (${user.email})`,
    };
  }
}
