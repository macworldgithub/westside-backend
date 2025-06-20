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

@Controller('vehicle')
export class VehicleRegistrationController {
  constructor(
    private readonly service: VehicleRegistrationService,
    private readonly awsService: AwsService,
  ) {}

  @Post('registration')
  @UseInterceptors(FileInterceptor('image'))
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

  // Elastic-style search
  @Get('search')
  async search(@Query('q') q: string): Promise<CarRegistrationResponseDto[]> {
    return this.service.searchAllFields(q);
  }

  // Update by chassis number
  @Put('update-by-chassis/:chassisNumber')
  async updateByChassis(
    @Param('chassisNumber') chassisNumber: string,
    @Body() dto: UpdateCarRegistrationByChassisDto,
  ): Promise<CarRegistrationResponseDto> {
    return this.service.updateByChassisNumber(chassisNumber, dto);
  }

  @Delete('delete-image-car/:chassisNumber')
  async deleteCarImage(
    @Param('chassisNumber') chassisNumber: string,
  ): Promise<String> {
    return this.service.deleteCarImage(chassisNumber);
  }

  @Put('upload-image')
  @UseInterceptors(FileInterceptor('image'))
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

    return this.service.uploadCarImage(body, file); // ✅ separate arguments
  }

  @Get('get-registered-car/:chassisNumber')
  async getRegisteredCar(
    @Param('chassisNumber') chassisNumber: string,
  ): Promise<ResRegisteredCarDto> {
    if (!chassisNumber) {
      throw new BadRequestException('Chassis number is required');
    }

    try {
      return await this.service.getRegisteredCar({ chassisNumber });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
