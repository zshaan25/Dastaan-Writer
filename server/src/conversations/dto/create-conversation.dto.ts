import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiPropertyOptional({
    description: 'Initial title for the conversation thread',
    example: 'AI Automation Internship Post',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Target publishing platform',
    example: 'LINKEDIN',
    default: 'LINKEDIN',
  })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({
    description: 'Type of post to create',
    example: 'ACHIEVEMENT',
    default: 'ACHIEVEMENT',
  })
  @IsOptional()
  @IsString()
  postType?: string;
}
