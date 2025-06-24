// src/user/user.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserRequestDto } from './dto/req/create-user-request.dto';
import { CreateUserResponseDto } from './dto/res/create-user-response.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.ShopManager, Role.SystemAdministrator)
  @Post('create-technician')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new Technician (ShopManager or Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Technician created',
    type: CreateUserResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Not allowed to access this endpoint.',
  })
  async createTechnician(
    @Body() body: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const user = await this.userService.createTechnician(
      body.name,
      body.email,
      body.password,
      body.address,
      body.mobile,
    );

    return {
      //@ts-ignore
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address,
    };
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.SystemAdministrator)
  @Post('create-manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Shop Manager (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Manager created',
    type: CreateUserResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden. Only Admins allowed.' })
  async createManager(
    @Body() body: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const user = await this.userService.createShopManager(
      body.name,
      body.email,
      body.password,
      body.address,
      body.mobile,
    );

    return {
      //@ts-ignore
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      mobile: user.mobile,
      address: user.address,
    };
  }
  @Post('create-admin')
  @ApiOperation({ summary: 'Create a new System Administrator' })
  @ApiResponse({
    status: 201,
    description: 'Admin created',
    type: CreateUserResponseDto,
  })
  async createAdmin(
    @Body() body: CreateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    const user = await this.userService.createSystemAdmin(
      body.name,
      body.email,
      body.password,
      body.address,
      body.mobile,
    );

    return {
      //@ts-ignore
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      role: user.role,
    };
  }
}
