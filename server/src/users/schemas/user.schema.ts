import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  profession: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: '' })
  experience: string;

  @Prop({ type: [String], default: [] })
  projects: string[];

  @Prop({ type: [String], default: [] })
  interests: string[];

  @Prop({ default: '' })
  writingStyle: string;

  @Prop({ default: '' })
  preferredTone: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
