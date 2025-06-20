import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateWorkOrderDto {
  @ApiProperty({ example: '665d123abcde001234567890' })
  @IsMongoId()
  @IsNotEmpty()
  car: string;

  @ApiProperty({ example: 'Ahmed Ali' })
  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @ApiProperty({ example: 'Umar Khan' })
  @IsString()
  @IsNotEmpty()
  headMechanic: string;

  @ApiProperty({ example: 'Zain Technician' })
  @IsString()
  @IsNotEmpty()
  orderCreatorName: string;

  @ApiProperty({ example: 'ahmed.ali@example.com' })
  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;

  @ApiProperty({ example: '03001234567' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '2025-06-21T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-06-25T18:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  finishDate: string;

  @ApiProperty({ example: '12-A Gulberg, Lahore' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '665d123abcde001234566789' })
  @IsMongoId()
  @IsNotEmpty()
  createdBy: string;
}
