import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReqRegisteredCarDto {
  @ApiProperty({
    description: 'Chassis number of the registered car',
    example: 'XYZ1234567890',
  })
  @IsString()
  @IsNotEmpty()
  chassisNumber: string;
}
