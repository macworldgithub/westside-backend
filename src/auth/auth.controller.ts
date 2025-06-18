// src/auth/auth.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/req/login-request.dto';
import { LoginResponseDto } from './dto/res/login-response.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginRequestDto,
  ): Promise<{credentials : LoginResponseDto}> {
    return this.authService.login(body.email, body.password);
  }
}
