import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateContentDto {
  @ApiProperty({
    description: 'The user prompt or instruction for AI generation',
    example: 'Write a concise technical update about completing an AI automation pipeline.',
    minLength: 5,
    maxLength: 4000,
  })
  @IsNotEmpty({ message: 'Prompt is required' })
  @IsString({ message: 'Prompt must be a text string' })
  @MinLength(5, { message: 'Prompt must be at least 5 characters long' })
  @MaxLength(4000, { message: 'Prompt cannot exceed 4000 characters' })
  prompt: string;

  @ApiPropertyOptional({
    description: 'Custom system instruction to override default assistant behavior',
    example: 'You are an elite technical copywriter.',
  })
  @IsOptional()
  @IsString()
  systemInstruction?: string;

  @ApiPropertyOptional({
    description: 'Optional response MIME type (e.g. application/json)',
    example: 'text/plain',
  })
  @IsOptional()
  @IsString()
  responseMimeType?: string;
}
