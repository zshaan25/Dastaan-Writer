import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type PostDocument = Post & Document;

export enum PostType {
  ACHIEVEMENT = 'ACHIEVEMENT',
  PROJECT = 'PROJECT',
  LEARNING = 'LEARNING',
  CAREER_UPDATE = 'CAREER_UPDATE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  THOUGHT_LEADERSHIP = 'THOUGHT_LEADERSHIP',
}

export enum PostTone {
  PROFESSIONAL = 'PROFESSIONAL',
  PERSONAL = 'PERSONAL',
  TECHNICAL = 'TECHNICAL',
  STORYTELLING = 'STORYTELLING',
  CONFIDENT = 'CONFIDENT',
  MINIMAL = 'MINIMAL',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  EDITED = 'EDITED',
  APPROVED = 'APPROVED',
}

export interface PostVersion {
  id: string; // Unique UUID
  label: string; // e.g. "Professional", "Personal", "Storytelling"
  tone: PostTone;
  hook: string;
  body: string;
  cta?: string;
  hashtags: string[];
  mentions: string[];
  createdAt: string;
}

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Conversation', required: false, index: true })
  conversationId?: Types.ObjectId;

  @Prop({ type: String, enum: PostType, required: true })
  postType: PostType;

  @Prop({ type: String, enum: PostTone, required: true })
  tone: PostTone;

  @Prop({ type: String, enum: PostStatus, default: PostStatus.DRAFT, required: true })
  status: PostStatus;

  // Canonical Content Fields (Single Source of Truth)
  @Prop({ type: String, required: true })
  hook: string;

  @Prop({ type: String, required: true })
  body: string;

  @Prop({ type: String, required: false, default: '' })
  cta?: string;

  @Prop({ type: [String], required: true, default: [] })
  hashtags: string[];

  @Prop({ type: [String], required: true, default: [] })
  mentions: string[];

  @Prop({ type: Array, required: true, default: [] })
  versions: PostVersion[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
