import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class ResRegisteredCarDto {
  @ApiProperty({
    description: 'MongoDB Object ID',
    example: '665f9a2c1f1b2a6a9c0d4e73',
  })
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Chassis number of the registered car',
    example: 'JN1AZ4EH9EM638992',
  })
  @IsString()
  @IsNotEmpty()
  chassisNumber: string;

  @ApiProperty({
    description: 'Vehicle license plate number',
    example: 'LEC-19-4567',
  })
  @IsString()
  plate: string;

  @ApiProperty({
    description: 'Car variant or trim level',
    example: 'Altis Grande 1.8 CVT',
  })
  @IsString()
  variant: string;

  @ApiProperty({
    description: 'Model name of the car',
    example: 'Toyota Corolla',
  })
  @IsString()
  model: string;

  @ApiProperty({
    description: 'Year the car was manufactured',
    example: 2021,
  })
  @IsNumber()
  year: number;

  @ApiProperty({
    description: 'URL or key to the car image',
    example: 'https://yourbucket.s3.amazonaws.com/cars/JN1AZ4EH9EM638992.jpg',
  })
  @IsString()
  image: string;
}
