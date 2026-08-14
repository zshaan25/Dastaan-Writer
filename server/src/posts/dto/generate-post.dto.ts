import { IsEnum, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PostType, PostTone } from '../schemas/post.schema';

export class GeneratePostDto {
  @ApiPropertyOptional({
    description: 'MongoDB ObjectId of the conversation to generate post from',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @IsOptional()
  @IsMongoId()
  conversationId?: string;

  @ApiPropertyOptional({
    description: 'Category or type of post',
    enum: PostType,
    example: PostType.ACHIEVEMENT,
  })
  @IsOptional()
  @IsEnum(PostType)
  postType?: PostType;

  @ApiPropertyOptional({
    description: 'Target voice/tone of the post',
    enum: PostTone,
    example: PostTone.PROFESSIONAL,
  })
  @IsOptional()
  @IsEnum(PostTone)
  tone?: PostTone;

  @ApiPropertyOptional({
    description: 'Custom instructions or specific points to include',
    example: 'Emphasize token optimization and scalable architecture.',
  })
  @IsOptional()
  @IsString()
  customInstructions?: string;
}
