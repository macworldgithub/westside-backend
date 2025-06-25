import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Repair, RepairSchema } from 'src/schemas/Repair.Schema';

import { WorkOrder, WorkOrderSchema } from 'src/schemas/Work-Order.Schema';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';

@Module({
  providers: [ReportService, AwsService],
  controllers: [ReportController],
  imports: [
    MongooseModule.forFeature([
      { name: Repair.name, schema: RepairSchema },

      { name: WorkOrder.name, schema: WorkOrderSchema },
    ]),
    AwsModule,
  ],
})
export class ReportModule {}
