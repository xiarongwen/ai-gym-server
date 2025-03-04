import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as AppleSignin from 'apple-signin-auth';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validatePhone(phone: string, password: string) {
    const user = await this.usersService.validateUser(phone, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async registerWithPhone(phone: string, password: string, name: string) {
    const existingUser = await this.usersService.findByPhone(phone);
    if (existingUser) {
      throw new UnauthorizedException('Phone number already registered');
    }

    const user = await this.usersService.createUser({
      phone,
      password,
      name,
      provider: 'local',
      isVerified: true, // 在实际应用中，应该通过短信验证后再设置为 true
    });

    return this.generateToken(user);
  }

  async loginWithPhone(phone: string, password: string) {
    const user = await this.validatePhone(phone, password);
    return this.generateToken(user);
  }

  async loginWithApple(idToken: string) {
    try {
      const appleUser = await AppleSignin.verifyIdToken(idToken, {
        audience: this.configService.get<string>('APPLE_CLIENT_ID'),
      });

      let user = await this.usersService.findByAppleId(appleUser.sub);
      if (!user) {
        // 如果用户不存在，创建新用户
        user = await this.usersService.createUser({
          appleId: appleUser.sub,
          name: appleUser.email?.split('@')[0] || 'Apple User',
          provider: 'apple',
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
      phone: user.phone,
      provider: user.provider,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
        provider: user.provider,
      },
    };
  }
}
