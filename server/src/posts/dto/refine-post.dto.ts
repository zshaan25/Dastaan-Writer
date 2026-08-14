import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostTone } from '../schemas/post.schema';

export enum RefinementAction {
  REGENERATE = 'REGENERATE',
  IMPROVE_HOOK = 'IMPROVE_HOOK',
  MAKE_SHORTER = 'MAKE_SHORTER',
  MAKE_MORE_PERSONAL = 'MAKE_MORE_PERSONAL',
  MAKE_MORE_TECHNICAL = 'MAKE_MORE_TECHNICAL',
  MAKE_MORE_PROFESSIONAL = 'MAKE_MORE_PROFESSIONAL',
  ADD_CTA = 'ADD_CTA',
  REMOVE_CTA = 'REMOVE_CTA',
  IMPROVE_FLOW = 'IMPROVE_FLOW',
  SIMPLIFY = 'SIMPLIFY',
  CHANGE_TONE = 'CHANGE_TONE',
  CREATE_ALTERNATIVES = 'CREATE_ALTERNATIVES',
}

export class WorkingVersionDto {
  @ApiPropertyOptional({ description: 'Current working hook' })
  hook?: string;

  @ApiPropertyOptional({ description: 'Current working body' })
  body?: string;

  @ApiPropertyOptional({ description: 'Current working call to action' })
  cta?: string;

  @ApiPropertyOptional({ description: 'Current hashtags', type: [String] })
  hashtags?: string[];

  @ApiPropertyOptional({ description: 'Current mentions', type: [String] })
  mentions?: string[];
}

export class RefinePostDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the post to refine',
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
  })
  @IsNotEmpty()
  @IsString()
  postId: string;

  @ApiProperty({
    description: 'Specific refinement action to apply',
    enum: RefinementAction,
    example: RefinementAction.IMPROVE_HOOK,
  })
  @IsNotEmpty()
  @IsEnum(RefinementAction)
  refinementAction: RefinementAction;

  @ApiPropertyOptional({
    description: 'New target tone (if changing tone)',
    enum: PostTone,
    example: PostTone.STORYTELLING,
  })
  @IsOptional()
  @IsEnum(PostTone)
  newTone?: PostTone;

  @ApiPropertyOptional({
    description: 'Custom instructions for the refinement',
    example: 'Focus on explaining the database optimization metrics.',
  })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiPropertyOptional({
    description: 'Current working state of post fields in editor (to preserve manual edits)',
    type: WorkingVersionDto,
  })
  @IsOptional()
  @IsObject()
  workingVersion?: WorkingVersionDto;
}
