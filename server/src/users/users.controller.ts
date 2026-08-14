import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get user profile', description: 'Retrieves complete profile data including career highlights and preferences.' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully.',
    schema: {
      example: {
        _id: '64f1a2b3c4d5e6f7a8b9c0d1',
        name: 'Zeeshan Qasim',
        email: 'zeeshan@example.com',
        bio: 'Full-stack AI developer passionate about agentic workflows.',
        profession: 'AI Automation Engineer',
        skills: ['NestJS', 'React', 'Gemini AI', 'n8n', 'MongoDB'],
        experience: 'Over 3 years building cloud-native web applications.',
        projects: ['Dastaan Social Assistant', 'Nexus AI Agent'],
        interests: ['LLM Orchestration', 'Microservices'],
        writingStyle: 'Storytelling and insight-driven',
        preferredTone: 'PROFESSIONAL',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    return user;
  }

  @Put('me')
  @ApiOperation({ summary: 'Update user profile', description: 'Updates profile fields and post generation preferences for the authenticated user.' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
    schema: {
      example: {
        _id: '64f1a2b3c4d5e6f7a8b9c0d1',
        name: 'Zeeshan Qasim',
        email: 'zeeshan@example.com',
        profession: 'AI Automation Engineer',
        skills: ['NestJS', 'React', 'Gemini AI'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error in request payload.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  async updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const updatedUser = await this.usersService.updateProfile(req.user.id, updateProfileDto);
    return updatedUser;
  }
}
