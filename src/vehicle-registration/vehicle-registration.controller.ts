import { Body, Controller, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CarRegistrationResponseDto } from './dto/res/car-registration-response.dto';
import { VehicleRegistrationService } from './vehicle-registration.service';
import { UpdateCarRegistrationByChassisDto } from './dto/req/update-car-registration.dto';
import { AwsService } from 'src/aws/aws.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCarRegistrationDto } from './dto/req/create-car-registration.dto';

@Controller('vehicle')
export class VehicleRegistrationController {
  constructor(
    private readonly service: VehicleRegistrationService,
    private readonly awsService: AwsService,
  ) {}

  @Post("registration")
  @UseInterceptors(
    FileInterceptor('image'),
  )
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
}
