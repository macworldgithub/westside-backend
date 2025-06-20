import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsString,
  IsMobilePhone,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/auth/roles.enum';

export class CreateUserRequestDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'securePass123',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Mobile number of the user (in E.164 or local format)',
    example: '923001234567',
  })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({
    description: 'Address of the user',
    example: '123-A Street, Lahore, Pakistan',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Role of the user',
    example: Role.Technician,
    enum: Role,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
