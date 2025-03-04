import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

interface RegisterDto {
  phone: string;
  password: string;
  name: string;
}

interface LoginDto {
  phone: string;
  password: string;
}

interface AppleLoginDto {
  idToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerWithPhone(
      registerDto.phone,
      registerDto.password,
      registerDto.name,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.loginWithPhone(loginDto.phone, loginDto.password);
  }

  @Post('apple')
  @HttpCode(HttpStatus.OK)
  async appleLogin(@Body() appleLoginDto: AppleLoginDto) {
    return this.authService.loginWithApple(appleLoginDto.idToken);
  }
}
