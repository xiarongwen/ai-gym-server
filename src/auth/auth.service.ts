import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as AppleSignin from 'apple-signin-auth';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // 尝试通过手机号查找用户
    let user = await this.usersService.findByPhone(username);
    // 如果没找到，尝试通过邮箱查找（向后兼容）
    if (!user) {
      user = await this.usersService.findByEmail(username);
    }
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      console.log('验证用户:', user);
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserById(userId: string): Promise<any> {
    try {
      console.log('验证用户ID:', userId);
      const user = await this.usersService.findById(userId);
      console.log('找到用户:', user ? '是' : '否');

      if (user) {
        // 标准化用户对象，确保_id为字符串
        const userDoc = user as any;
        return {
          ...userDoc,
          _id: userDoc._id.toString(),
        };
      }
      return null;
    } catch (error) {
      console.error('验证用户ID失败:', error);
      return null;
    }
  }

  async register(phone: string, password: string, nickname: string) {
    // 检查手机号是否已注册
    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new UnauthorizedException('Phone number already registered');
    }

    const user = await this.usersService.createUser({
      phone,
      hashedPassword: password,
      nickname,
      isVerified: false, // 需要通过短信验证
    });

    return this.generateToken(user);
  }

  async login(user: any) {
    console.log('登录用户:', user);
    // 检查用户对象
    if (!user) {
      throw new UnauthorizedException('无效的用户信息');
    }

    // 标准化用户对象，确保能够访问_id
    const userDoc = (user as any)._doc || user;

    // 确保用户ID存在且转换为字符串格式
    const userId = userDoc._id ? userDoc._id.toString() : null;

    console.log('用户ID (标准化后):', userId);

    if (!userId) {
      throw new UnauthorizedException('无效的用户ID');
    }

    const payload = {
      // 使用手机号作为用户名，如果没有则使用邮箱（向后兼容）
      username: userDoc.phone || userDoc.email,
      sub: userId,
    };

    console.log('生成令牌，用户ID:', payload.sub);
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        username: userDoc.username,
        email: userDoc.email,
        phone: userDoc.phone,
        nickname: userDoc.nickname,
      },
    };
  }

  async loginWithApple(idToken: string) {
    try {
      const appleUser = await AppleSignin.verifyIdToken(idToken, {
        audience: this.configService.get<string>('APPLE_CLIENT_ID'),
      });

      // 由于 Apple 登录使用邮箱，我们需要保持这部分逻辑
      let user = await this.usersService.findByEmail(appleUser.email);
      if (!user) {
        // 如果用户不存在，创建新用户
        user = await this.usersService.createUser({
          email: appleUser.email,
          nickname: appleUser.email?.split('@')[0] || 'Apple User',
          isVerified: true,
        });
      }

      return this.generateToken(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple ID token', error);
    }
  }

  private generateToken(user: any) {
    const payload = {
      sub: user._id,
      // 优先使用手机号，如果没有则使用邮箱
      username: user.phone || user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }
}
