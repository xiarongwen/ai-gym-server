import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  hashedPassword: string;

  @Prop({ required: true })
  nickname: string;

  @Prop()
  avatar?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ default: false })
  isVerified: boolean;

  // 用户基本信息
  @Prop()
  gender?: 'male' | 'female' | 'other';

  @Prop()
  birthDate?: Date;

  @Prop()
  height?: number; // 身高（厘米）

  @Prop()
  weight?: number; // 体重（千克）

  // 账户状态
  @Prop({ default: 'active' })
  status: 'active' | 'inactive' | 'suspended';

  @Prop({ default: 'user' })
  role: 'user' | 'trainer' | 'admin';

  // 基础设置
  @Prop({ type: Object, default: {} })
  preferences: {
    language?: string;
    notifications?: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
