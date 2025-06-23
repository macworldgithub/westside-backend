import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateRepairDto {
  @IsOptional()
  @IsString()
  mechanicName?: string;

  @IsOptional()
  @IsString()
  partName?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsDateString()
  finishDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  submitted?: boolean;

  @IsOptional()
  @IsString()
  beforeImageUri?: string;

  @IsOptional()
  @IsString()
  afterImageUri?: string;
}
