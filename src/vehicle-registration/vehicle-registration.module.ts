import { Module } from '@nestjs/common';
import { VehicleRegistrationService } from './vehicle-registration.service';
import { VehicleRegistrationController } from './vehicle-registration.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CarRegistration, CarRegistrationSchema } from 'src/schemas/Car-Registration.Schema';

import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';
import { WorkOrder, WorkOrderSchema } from 'src/schemas/Work-Order.Schema';

@Module({
  providers: [VehicleRegistrationService ,AwsService],
  controllers: [VehicleRegistrationController],
  imports:[ MongooseModule.forFeature([
      { name: CarRegistration.name, schema: CarRegistrationSchema },
       { name: WorkOrder.name, schema: WorkOrderSchema },
    ]) ,AwsModule]
})
export class VehicleRegistrationModule {}
