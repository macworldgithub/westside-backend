import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class UpdateWorkOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headMechanic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  orderCreatorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  finishDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ enum: ['in_progress', 'completed'] })
  @IsOptional()
  @IsEnum(['in_progress', 'completed'])
  status?: 'in_progress' | 'completed';
}
