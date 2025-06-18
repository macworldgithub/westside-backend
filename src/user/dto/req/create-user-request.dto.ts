// src/user/dto/create-user-request.dto.ts
import { Expose } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from 'src/auth/roles.enum';

export class CreateUserRequestDto {
  @Expose()
  _id: string;
  
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}
