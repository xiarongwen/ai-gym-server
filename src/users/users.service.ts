import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(userData: Partial<User>): Promise<User> {
    if (userData.hashedPassword) {
      userData.hashedPassword = await bcrypt.hash(userData.hashedPassword, 10);
    }
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && user.hashedPassword) {
      const isValid = await bcrypt.compare(password, user.hashedPassword);
      if (isValid) {
        return user;
      }
    }
    return null;
  }
}
