// src/user/user.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/roles.enum';
import { User, UserDocument } from 'src/schemas/User.Schemas';
import { UpdateUserRequestDto } from './dto/req/update-user-request.dto';
import { UpdateUserResponseDto } from './dto/res/update-user-response.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    name: string,
    email: string,
    password: string,
    role: Role,
    address: string,
    mobile: string,
  ): Promise<User> {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role,
      address,
      mobile,
    });
    return createdUser.save();
  }

  async createTechnician(
    name: string,
    email: string,
    password: string,
    address: string,
    mobile: string,
  ) {
    return this.createUser(
      name,
      email,
      password,
      Role.Technician,
      address,
      mobile,
    );
  }

  async createShopManager(
    name: string,
    email: string,
    password: string,
    address: string,
    mobile: string,
  ) {
    return this.createUser(
      name,
      email,
      password,
      Role.ShopManager,
      address,
      mobile,
    );
  }

  async createSystemAdmin(
    name: string,
    email: string,
    password: string,
    address: string,
    mobile: string,
  ) {
    return this.createUser(
      name,
      email,
      password,
      Role.SystemAdministrator,
      address,
      mobile,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async updateUser(
    userId: string,
    dto: UpdateUserRequestDto,
    initiatedById: string,
  ): Promise<UpdateUserResponseDto> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const initiator = await this.userModel.findById(initiatedById);
    if (!initiator) throw new NotFoundException('Initiating user not found');

    const isSystemAdmin = initiator.role === Role.SystemAdministrator;

    // ❌ Don't allow _id overwrite
    if ('_id' in dto) delete dto._id;

    if (!isSystemAdmin) {
      // 🚫 Email change not allowed for non-admins
      if ('email' in dto) delete dto.email;
      if ('role' in dto) delete dto.role;

      // 🔒 Verify current password
      if (!dto.currentPassword) {
        throw new ForbiddenException('Current password is required');
      }

      const isPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new ForbiddenException('Current password is incorrect');
      }
    }

    // 🔐 Hash new password if provided
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      dto.password = await bcrypt.hash(dto.password, salt);
    }

    delete dto.currentPassword;

    Object.assign(user, dto);
    const updated = await user.save();

    return {
      _id: updated._id.toString(),
      name: updated.name,
      email: updated.email,
      role: updated.role,
      mobile: updated.mobile.toString(),
      address: updated.address,
    };
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

}
