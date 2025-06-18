import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { CarRegistrationResponseDto } from './dto/res/car-registration-response.dto';
import { VehicleRegistrationService } from './vehicle-registration.service';
import { UpdateCarRegistrationByChassisDto } from './dto/req/update-car-registration.dto';

@Controller('vehicle-registration')
export class VehicleRegistrationController {
  constructor(private readonly service: VehicleRegistrationService) {}

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
