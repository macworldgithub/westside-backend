import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateRepairDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  workOrder: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  partName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mechanicName: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  finishDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  beforeImageUri?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  afterImageUri?: string; // ✅ NEW FIELD ADDED
}
