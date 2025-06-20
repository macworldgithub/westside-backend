import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorkOrder, WorkOrderDocument } from 'src/schemas/Work-Order.Schema';
import { CreateWorkOrderDto } from './dto/req/create-work-order-dto';

@Injectable()
export class WorkorderService {
  constructor(
    @InjectModel(WorkOrder.name)
    private workOrderModel: Model<WorkOrderDocument>,
  ) {}

  async createWorkOrder(dto: CreateWorkOrderDto): Promise<WorkOrder> {
    const {
      car,
      ownerName,
      headMechanic,
      orderCreatorName,
      ownerEmail,
      phoneNumber,
      startDate,
      finishDate,
      address,
      createdBy,
    } = dto;

    const newWorkOrder = new this.workOrderModel({
      car,
      ownerName,
      headMechanic,
      orderCreatorName,
      ownerEmail,
      phoneNumber,
      startDate,
      finishDate,
      address,
      createdBy,
      status: 'in_progress', // Default
    });

    return await newWorkOrder.save();
  }
}
