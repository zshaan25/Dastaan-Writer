import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'User message to send to the Dastaan AI assistant',
    example: 'I completed my AI automation internship using Gemini and n8n.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @IsString({ message: 'Message must be a text string' })
  @MinLength(1, { message: 'Message must be at least 1 character long' })
  @MaxLength(2000, { message: 'Message cannot exceed 2000 characters' })
  message: string;
}
