import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReqCarImageDto {
  @ApiProperty({
    description: 'Chassis number of the car',
    example: 'ABC1234567890',
  })
  @IsString()
  @IsNotEmpty()
  chassisNumber: string;
}
