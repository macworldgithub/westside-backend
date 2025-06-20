// req-car-image.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReqCarImageDto {
  @ApiProperty({ example: 'ABC1234567890', description: 'Chassis number' })
  @IsString()
  @IsNotEmpty()
  chassisNumber: string;

  // File can't be validated with class-validator, so we manually check it
  image: any;
}

// res-car-image.dto.ts
export class ResCarImageDto {
  status: string;
  image: string;
}
