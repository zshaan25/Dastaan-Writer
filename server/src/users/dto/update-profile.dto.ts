import { IsString, IsOptional, IsArray, Length } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Updated user full name',
    example: 'Zeeshan Qasim',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Short professional bio',
    example: 'Full-stack AI developer passionate about agentic workflows.',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Current profession or title',
    example: 'AI Automation Engineer',
  })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({
    description: 'List of technical or domain skills',
    example: ['NestJS', 'React', 'Gemini AI', 'n8n', 'MongoDB'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({
    description: 'Experience summary or highlights',
    example: 'Over 3 years building cloud-native web applications and automation pipelines.',
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiPropertyOptional({
    description: 'Notable projects or portfolio items',
    example: ['Dastaan Social Assistant', 'Nexus AI Agent'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projects?: string[];

  @ApiPropertyOptional({
    description: 'Professional or learning interests',
    example: ['LLM Orchestration', 'Microservices', 'Distributed Systems'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({
    description: 'Preferred writing style',
    example: 'Storytelling and insight-driven',
  })
  @IsOptional()
  @IsString()
  writingStyle?: string;

  @ApiPropertyOptional({
    description: 'Default target tone for generated posts',
    example: 'PROFESSIONAL',
  })
  @IsOptional()
  @IsString()
  preferredTone?: string;
}
