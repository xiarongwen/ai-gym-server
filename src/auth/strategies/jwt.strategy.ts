import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
    });
  }

  async validate(payload: any) {
    try {
      this.logger.debug(`JWT验证: ${JSON.stringify(payload)}`);
      if (!payload || !payload.sub) {
        this.logger.error('JWT payload 无效');
        throw new UnauthorizedException('无效的令牌');
      }
      const user = await this.authService.validateUserById(payload.sub);
      if (!user) {
        this.logger.error(`用户未找到: ${payload.sub}`);
        throw new UnauthorizedException('用户未找到');
      }
      this.logger.debug(`用户验证成功: ${user._id}`);
      return user;
    } catch (error) {
      this.logger.error(`JWT验证失败: ${error.message}`, error.stack);
      throw new UnauthorizedException('用户未授权');
    }
  }
}
