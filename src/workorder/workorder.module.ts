import { Module } from '@nestjs/common';
import { WorkorderService } from './workorder.service';
import { WorkorderController } from './workorder.controller';

@Module({
  providers: [WorkorderService],
  controllers: [WorkorderController]
})
export class WorkorderModule {}
