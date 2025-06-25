import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from './roles.enum';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

import { LoginResponseDto } from './dto/res/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ credentials: LoginResponseDto }> {
    const user = await this.userService.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    let payload = {
      //@ts-ignore
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: 'anas',
    });

    let credentials: LoginResponseDto = {
      //@ts-ignore
      _id: user._id,
      name:user.name,
      email: user.email,
      role: user.role,
      token: accessToken, // ✅ matches LoginCredentials
    };

    return { credentials };
  }
}
