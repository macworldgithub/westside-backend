import { Module } from '@nestjs/common';
import { VehicleRegistrationService } from './vehicle-registration.service';
import { VehicleRegistrationController } from './vehicle-registration.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CarRegistration, CarRegistrationSchema } from 'src/schemas/Car-Registration.Schema';

@Module({
  providers: [VehicleRegistrationService],
  controllers: [VehicleRegistrationController],
  imports:[ MongooseModule.forFeature([
      { name: CarRegistration.name, schema: CarRegistrationSchema },
    ]),]
})
export class VehicleRegistrationModule {}
