import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a user account and returns user profile details.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully.',
    schema: {
      example: {
        message: 'User registered successfully',
        user: {
          _id: '64f1a2b3c4d5e6f7a8b9c0d1',
          name: 'Zeeshan Qasim',
          email: 'zeeshan@example.com',
          createdAt: '2026-08-14T10:00:00.000Z',
          updatedAt: '2026-08-14T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error in request payload.' })
  @ApiResponse({ status: 409, description: 'An account with this email address already exists.' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user', description: 'Validates user credentials and returns a signed JWT access token.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully.',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          _id: '64f1a2b3c4d5e6f7a8b9c0d1',
          name: 'Zeeshan Qasim',
          email: 'zeeshan@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error in request payload.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset user password', description: 'Allows resetting user password by email.' })
  @ApiResponse({ status: 200, description: 'Password reset successfully.' })
  @ApiResponse({ status: 401, description: 'No account found with this email address.' })
  async resetPassword(@Body() resetDto: { email: string; newPassword: string }) {
    return this.authService.resetPassword(resetDto.email, resetDto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current authenticated user session', description: 'Retrieves profile information for the token bearer.' })
  @ApiResponse({
    status: 200,
    description: 'Session valid; user profile returned.',
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
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT authentication token.' })
  async getMe(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    return user;
  }
}
