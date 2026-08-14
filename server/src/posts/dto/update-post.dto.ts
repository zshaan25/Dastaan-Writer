import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PostType, PostTone, PostStatus } from '../schemas/post.schema';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'Post category/type',
    enum: PostType,
    example: PostType.ACHIEVEMENT,
  })
  @IsOptional()
  @IsEnum(PostType)
  postType?: PostType;

  @ApiPropertyOptional({
    description: 'Post tone',
    enum: PostTone,
    example: PostTone.PROFESSIONAL,
  })
  @IsOptional()
  @IsEnum(PostTone)
  tone?: PostTone;

  @ApiPropertyOptional({
    description: 'Status of the post',
    enum: PostStatus,
    example: PostStatus.EDITED,
  })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({
    description: 'Opening hook line of the post',
    example: 'Completing my AI automation internship taught me one critical lesson...',
  })
  @IsOptional()
  @IsString()
  hook?: string;

  @ApiPropertyOptional({
    description: 'Multi-paragraph body text of the post',
    example: 'Over the past 3 months, I focused on building AI pipelines using Gemini and n8n...',
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({
    description: 'Call to action closing text',
    example: 'What automation patterns have worked best for your team?',
  })
  @IsOptional()
  @IsString()
  cta?: string;

  @ApiPropertyOptional({
    description: 'Hashtags attached to post',
    example: ['#AIAutomation', '#Gemini', '#n8n', '#MongoDB', '#CareerGrowth'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({
    description: 'Mentions attached to post',
    example: ['@DafiLabs'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];
}
