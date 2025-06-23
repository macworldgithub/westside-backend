import { Module } from '@nestjs/common';
import { RepairController } from './repair.controller';
import { RepairService } from './repair.service';

@Module({
  controllers: [RepairController],
  providers: [RepairService]
})
export class RepairModule {}
