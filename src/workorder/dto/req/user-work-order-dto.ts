import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
  IsIn,
} from 'class-validator';

export class UserWorkOrdersQueryDto {
  @ApiProperty({ example: '665d123abcde001234567890' })
  @IsMongoId()
  @IsNotEmpty()
  userId: string;


  @ApiProperty({ example: '665d123abcde001234567890' })
  @IsMongoId()
  @IsOptional()
  carId: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({
    example: 'in_progress',
    enum: ['in_progress', 'completed'],
  })
  @IsOptional()
  @IsIn(['in_progress', 'completed'])
  status?: 'in_progress' | 'completed';

  @ApiPropertyOptional({ example: '2025-06-01' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-06-30' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'ahmed' })
  @IsOptional()
  search?: string;
}
