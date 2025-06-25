// dto/update-user-request.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  MinLength,
  IsMobilePhone,
} from 'class-validator';
import { Role } from 'src/auth/roles.enum';


export class UpdateUserRequestDto {

  @ApiProperty({ description: 'Current password for verification' })
  @IsString()
  @MinLength(6)
  currentPassword: string;
  
  @ApiPropertyOptional({ example: 'Ali Raza' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'ali@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'newSecurePass123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'Technician', enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: '923001234567' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ example: '123-A Main Blvd, Lahore' })
  @IsOptional()
  @IsString()
  address?: string;
}
