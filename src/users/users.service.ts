import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return this.userModel.findOne({ email }).exec();
    } catch (error) {
      this.logger.error(`查找用户邮箱失败: ${email}`, error.stack);
      throw error;
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    try {
      return this.userModel.findOne({ phone }).exec();
    } catch (error) {
      this.logger.error(`查找用户手机号失败: ${phone}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      return this.userModel.findById(id).exec();
    } catch (error) {
      this.logger.error(`查找用户ID失败: ${id}`, error.stack);
      throw error;
    }
  }

  async createUser(userData: Partial<User>): Promise<User> {
    try {
      this.logger.log(`开始创建用户: ${userData.phone || userData.email}`);
      if (userData.hashedPassword) {
        userData.hashedPassword = await bcrypt.hash(
          userData.hashedPassword,
          10,
        );
      }
      const createdUser = new this.userModel(userData);
      const savedUser = await createdUser.save();
      this.logger.log(`用户创建成功: ${savedUser._id}`);
      return savedUser;
    } catch (error) {
      this.logger.error(
        `创建用户失败: ${userData.phone || userData.email}`,
        error.stack,
      );
      throw error;
    }
  }

  async validateUserByPhone(
    phone: string,
    password: string,
  ): Promise<User | null> {
    try {
      const user = await this.findByPhone(phone);
      if (user && user.hashedPassword) {
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (isValid) {
          return user;
        }
      }
      return null;
    } catch (error) {
      this.logger.error(`验证用户失败: ${phone}`, error.stack);
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (user && user.hashedPassword) {
        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (isValid) {
          return user;
        }
      }
      return null;
    } catch (error) {
      this.logger.error(`验证用户失败: ${email}`, error.stack);
      throw error;
    }
  }
}
