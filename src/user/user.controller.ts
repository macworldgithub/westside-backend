// src/user/user.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/req/create-user-request.dto';
import { CreateUserResponseDto } from './dto/res/create-user-response.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Roles(Role.ShopManager, Role.SystemAdministrator)
  @Post('create-technician')
  async createTechnician(
    @Body() body: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const user = await this.userService.createTechnician(
      body.name,
      body.email,
      body.password,
      body.address,
      body.mobile
    );

    return {
      //@ts-ignore
      _id: user._id.toString(), // Explicitly cast if needed
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SystemAdministrator)
  @Post('create-manager')
  async createManager(
    @Body() body: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const user = await this.userService.createShopManager(
      body.name,
      body.email,
      body.password,
           body.address,
      body.mobile
    );

    return {
      //@ts-ignore
      _id: user._id.toString(), // Explicitly cast if needed
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address,
    };
  }

  @Post('create-admin')
  async createAdmin(
    @Body() body: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const user = await this.userService.createSystemAdmin(
      body.name,
      body.email,
      body.password,
      body.address,
      body.mobile
    );

    return {
      //@ts-ignore
      _id: user._id.toString(), // Explicitly cast if needed
      name: user.name,
      email: user.email,
       mobile:user.mobile,
      address:user.address,
      role: user.role,
    };
  }
}
