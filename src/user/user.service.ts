// src/user/user.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/auth/roles.enum';
import { User, UserDocument } from 'src/schemas/User.Schemas';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    name: string,
    email: string,
    password: string,
    role: Role,
  ): Promise<User> {
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = new this.userModel({ name, email, password: hashedPassword, role });
    return createdUser.save();
  }

  async createTechnician(name: string, email: string, password: string) {
    return this.createUser(name, email, password, Role.Technician);
  }

  async createShopManager(name: string, email: string, password: string) {
    return this.createUser(name, email, password, Role.ShopManager);
  }

  async createSystemAdmin(name: string, email: string, password: string) {
    return this.createUser(name, email, password, Role.SystemAdministrator);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }
}
