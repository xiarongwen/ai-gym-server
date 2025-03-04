import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  phone?: string;

  @Prop()
  password?: string;

  @Prop({ unique: true, sparse: true })
  appleId?: string;

  @Prop()
  name: string;

  @Prop()
  avatar?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: 'local' })
  provider: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
