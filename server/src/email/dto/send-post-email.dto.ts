import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPostEmailDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the post to deliver to the authenticated user email',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @IsString({ message: 'Post ID must be a string' })
  @IsNotEmpty({ message: 'Post ID is required' })
  postId: string;
}
