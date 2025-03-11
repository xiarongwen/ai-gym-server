import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

interface RegisterDto {
  email: string;
  password: string;
  nickname: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface AppleLoginDto {
  idToken: string;
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    registerDto: { phone: string; password: string; nickname: string },
  ) {
    try {
      this.logger.log(`注册请求: ${JSON.stringify(registerDto)}`);
      const result = await this.authService.register(
        registerDto.phone,
        registerDto.password,
        registerDto.nickname,
      );
      this.logger.log(`注册成功: ${registerDto.phone}`);
      return result;
    } catch (error) {
      this.logger.error(`注册失败: ${registerDto.phone}`, error.stack);
      throw new HttpException(
        error.message || '注册失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    try {
      this.logger.log(`登录请求: ${loginDto.email}`);
      const result = await this.authService.login(loginDto);
      this.logger.log(`登录成功: ${loginDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(`登录失败: ${loginDto.email}`, error.stack);
      throw new HttpException(
        error.message || '登录失败',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async appleLogin(@Body() appleLoginDto: AppleLoginDto) {
    try {
      this.logger.log('Apple登录请求');
      const result = await this.authService.loginWithApple(
        appleLoginDto.idToken,
      );
      this.logger.log('Apple登录成功');
      return result;
    } catch (error) {
      this.logger.error('Apple登录失败', error.stack);
      throw new HttpException(
        error.message || 'Apple登录失败',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
