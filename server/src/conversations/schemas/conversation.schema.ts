import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export enum ConversationStatus {
  COLLECTING_CONTEXT = 'COLLECTING_CONTEXT',
  READY_FOR_DRAFT = 'READY_FOR_DRAFT',
  DRAFT_GENERATED = 'DRAFT_GENERATED',
  COMPLETED = 'COMPLETED',
}

export enum ConversationIntent {
  ACHIEVEMENT = 'ACHIEVEMENT',
  PROJECT = 'PROJECT',
  LEARNING = 'LEARNING',
  CAREER_UPDATE = 'CAREER_UPDATE',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  THOUGHT_LEADERSHIP = 'THOUGHT_LEADERSHIP',
  OTHER = 'OTHER',
}

@Schema({ _id: false })
export class ConversationMessage {
  @Prop({ required: true, enum: ['user', 'assistant'] })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ required: false, enum: ['ASK_FOLLOW_UP', 'GENERATE_DRAFT', null], default: null })
  action?: string;

  @Prop({ required: false })
  draftContent?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Post', required: false })
  postId?: Types.ObjectId;
}

const ConversationMessageSchema = SchemaFactory.createForClass(ConversationMessage);

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Post', required: false, index: true })
  postId?: Types.ObjectId;

  @Prop({ default: 'New Dastaan Post' })
  title: string;

  @Prop({ required: true, enum: ConversationStatus, default: ConversationStatus.COLLECTING_CONTEXT })
  status: string;

  @Prop({ required: true, enum: ConversationIntent, default: ConversationIntent.OTHER })
  intent: string;

  @Prop({ required: true, default: 'LINKEDIN' })
  platform: string;

  @Prop({ required: true, default: 'achievement' })
  postType: string;

  @Prop({ type: [ConversationMessageSchema], default: [] })
  messages: ConversationMessage[];

  @Prop({ type: Object, default: {} })
  collectedContext: Record<string, any>;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
