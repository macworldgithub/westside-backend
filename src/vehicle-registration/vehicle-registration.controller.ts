import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CarRegistrationResponseDto } from './dto/res/car-registration-response.dto';
import { VehicleRegistrationService } from './vehicle-registration.service';
import { UpdateCarRegistrationByChassisDto } from './dto/req/update-car-registration.dto';
import { AwsService } from 'src/aws/aws.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCarRegistrationDto } from './dto/req/create-car-registration.dto';
import { ReqCarImageDto } from './dto/req/upload-car-image-dto';
import { ResCarImageDto } from './dto/res/uplaod-car-image-dto';
import { ReqRegisteredCarDto } from './dto/req/get-registered-car-dto';
import { ResRegisteredCarDto } from './dto/res/get-registered-car-dto';
import { Role } from 'src/auth/roles.enum';

import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Car Registration')
@Controller('vehicle')
export class VehicleRegistrationController {
  constructor(
    private readonly service: VehicleRegistrationService,
    private readonly awsService: AwsService,
  ) {}

  @Post('registration')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Register a car with optional image upload' })
  @ApiBody({
    description: 'Car registration data',
    type: CreateCarRegistrationDto,
  })
  @ApiResponse({ status: 201, description: 'Car registered successfully' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateCarRegistrationDto,
  ) {
    let imageUrl: string | undefined = undefined;

    if (file) {
      imageUrl = await this.awsService.uploadFile(
        file.buffer,
        file.originalname,
        'cars',
        file.mimetype,
      );
    }

    return this.service.create({
      ...body,
      image: await this.awsService.getSignedUrl(imageUrl),
    });
  }

  @Put('update-by-chassis/:chassisNumber')
  @ApiOperation({ summary: 'Update a registered car by chassis number' })
  @ApiParam({ name: 'chassisNumber', example: 'ABC1234567890' })
  @ApiResponse({
    status: 200,
    description: 'Updated successfully',
    type: CarRegistrationResponseDto,
  })
  async updateByChassis(
    @Param('chassisNumber') chassisNumber: string,
    @Body() dto: UpdateCarRegistrationByChassisDto,
  ): Promise<CarRegistrationResponseDto> {
    return this.service.updateByChassisNumber(chassisNumber, dto);
  }

  @Delete('delete-image-car/:chassisNumber')
  @ApiOperation({ summary: 'Delete car image by chassis number' })
  @ApiParam({ name: 'chassisNumber', example: 'ABC1234567890' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deleteCarImage(
    @Param('chassisNumber') chassisNumber: string,
  ): Promise<string> {
    return this.service.deleteCarImage(chassisNumber);
  }

  @Put('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload/update image for a registered car' })
  @ApiBody({
    description: 'Car image and chassis number',
    type: ReqCarImageDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    type: ResCarImageDto,
  })
  async uploadCarImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ReqCarImageDto,
  ): Promise<ResCarImageDto> {
    if (!file) {
      throw new BadRequestException('Provide Car Image');
    }

    if (!body.chassisNumber) {
      throw new BadRequestException('Provide Car Chassis Number');
    }

    return this.service.uploadCarImage(body, file);
  }

  @Get('cars-by-user/:userId')
  @ApiOperation({
    summary:
      'Get registered cars by user role (technician, shopManager, or systemAdministrator)',
  })
  @ApiParam({ name: 'userId', example: '68550514416bab0783af333b' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false, example: 'Toyota' })
  @ApiResponse({ status: 200, description: 'List of cars for the user' })
  async getCarsForUser(
    @Param('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('search') search?: string,
  ) {

    return this.service.getRegisteredCarsForUser(
      userId,
      parseInt(page),
      parseInt(limit),
      search,
    );
  }
}
