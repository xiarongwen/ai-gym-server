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
    const user = await this.usersService.findByEmail(username);
    if (user && (await bcrypt.compare(password, user.hashedPassword))) {
      const { hashedPassword, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserById(userId: string): Promise<any> {
    const user = await this.usersService.findById(userId);
    if (user) {
      return user;
    }
    return null;
  }

  async register(email: string, password: string, nickname: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email already registered');
    }

    const user = await this.usersService.createUser({
      email,
      hashedPassword: password,
      nickname,
      isVerified: false, // 需要通过邮箱验证
    });

    return this.generateToken(user);
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginWithApple(idToken: string) {
    try {
      const appleUser = await AppleSignin.verifyIdToken(idToken, {
        audience: this.configService.get<string>('APPLE_CLIENT_ID'),
      });

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
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }
}
