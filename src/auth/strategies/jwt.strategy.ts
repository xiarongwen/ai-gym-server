import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.authService.validateUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户未找到');
      }
      return user;
    } catch (error) {
      console.error('JWT验证失败:', error);
      throw new UnauthorizedException('用户未授权');
    }
  }
}
