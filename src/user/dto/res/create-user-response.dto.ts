import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Role } from 'src/auth/roles.enum';

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'MongoDB Object ID of the user',
    example: '665f9a2c1f1b2a6a9c0d4e73',
  })
  @IsString()
  @IsNotEmpty()
  _id: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Mobile number of the user',
    example: 923001234567,
  })
  @IsNumber()
  @IsNotEmpty()
  mobile: number;

  @ApiProperty({
    description: 'Residential address of the user',
    example: '123-A Street, Lahore, Pakistan',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    example: Role.Technician,
    enum: Role,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
