// create-repair.dto.ts
import { IsMongoId, IsNotEmpty, IsString, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRepairDto {
  @ApiProperty()
  @IsMongoId()
  workOrder: string;

  @ApiProperty()
  @IsString()
  mechanicName: string;

  @ApiProperty()
  @IsString()
  partName: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsDateString()
  finishDate: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
