import { Module } from '@nestjs/common';
import { RepairController } from './repair.controller';
import { RepairService } from './repair.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { RepairSchema, Repair } from 'src/schemas/Repair.Schema';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';
import { User, UserSchema } from 'src/schemas/User.Schemas';
import { WorkOrder, WorkOrderSchema } from 'src/schemas/Work-Order.Schema';

@Module({
  controllers: [RepairController],
  providers: [RepairService, AwsService],
  imports: [
    MongooseModule.forFeature([
      { name: Repair.name, schema: RepairSchema },
      { name: User.name, schema: UserSchema },
      { name: WorkOrder.name, schema: WorkOrderSchema },
    
    ]),
    AwsModule,
  ],
})
export class RepairModule {}
