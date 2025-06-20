import { Body, Controller, Post } from '@nestjs/common';
import { CreateWorkOrderDto } from './dto/req/create-work-order-dto';
import { WorkorderService } from './workorder.service';
import { WorkOrder } from 'src/schemas/Work-Order.Schema';
import { WorkOrderResponseDto } from './dto/res/create-work-order-dto';

@Controller('workorder')
export class WorkorderController {
  constructor(private readonly workOrderService: WorkorderService) {}

  @Post('create-work-order')
  async createWorkOrder(@Body() dto: CreateWorkOrderDto): Promise<WorkOrder> {
    return this.workOrderService.createWorkOrder(dto);
  }
}
