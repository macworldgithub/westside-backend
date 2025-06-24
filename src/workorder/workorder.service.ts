import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { WorkOrder, WorkOrderDocument } from 'src/schemas/Work-Order.Schema';
import { CreateWorkOrderDto } from './dto/req/create-work-order-dto';
import { User, UserDocument } from 'src/schemas/User.Schemas';
import { UpdateWorkOrderDto } from './dto/req/update-work-order-dto';
import { Role } from 'src/auth/roles.enum';

@Injectable()
export class WorkorderService {
  constructor(
    @InjectModel(WorkOrder.name)
    private workOrderModel: Model<WorkOrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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

  // 🔍 Step 1: Find user by createdBy
  const user = await this.userModel.findById(createdBy);
  if (!user) {
    throw new NotFoundException('User (createdBy) not found');
  }

  // 🔒 Step 2: Allow only ShopManager or SystemAdmin
  if (user.role !== Role.ShopManager && user.role !== Role.SystemAdministrator) {
    throw new ForbiddenException('Only shop managers or administrators can create work orders');
  }

  // ✅ Step 3: Create work order
  const workOrder = new this.workOrderModel({
    car: new Types.ObjectId(car),
    ownerName,
    headMechanic,
    orderCreatorName,
    ownerEmail,
    phoneNumber,
    startDate: new Date(startDate),
    finishDate: new Date(finishDate),
    address,
    createdBy: new Types.ObjectId(createdBy),
    status: 'in_progress',
    shopManagers: user.role === Role.ShopManager ? [user._id] : [],
  });

  return await workOrder.save();
}



  async addMechanicToWorkOrder(
    workOrderId: string,
    mechanicId: string,
  ): Promise<string> {
    const workOrder = await this.workOrderModel.findById(workOrderId);
    if (!workOrder) throw new NotFoundException('Work order not found');

    const mechanic = await this.userModel.findById(mechanicId);
    if (!mechanic) throw new NotFoundException('Mechanic not found');

    //@ts-ignore
    if (workOrder.mechanics.includes(mechanic._id)) {
      throw new BadRequestException(
        'Mechanic already assigned to this work order',
      );
    }

    //@ts-ignore
    workOrder.mechanics.push(mechanic._id);
    await workOrder.save();
    return 'Mechanic added successfully';
  }

  async addManagerToWorkOrder(
    workOrderId: string,
    managerId: string,
  ): Promise<string> {
    const workOrder = await this.workOrderModel.findById(workOrderId);
    if (!workOrder) throw new NotFoundException('Work order not found');

    const manager = await this.userModel.findById(managerId);
    if (!manager) throw new NotFoundException('Shop manager not found');

    //@ts-ignore
    if (workOrder.shopManager.includes(manager._id)) {
      throw new BadRequestException(
        'Manager already assigned to this work order',
      );
    }

    //@ts-ignore
    workOrder.shopManager.push(manager._id);
    await workOrder.save();
    return 'Manager added successfully';
  }

  async deleteMechanicFromWorkOrders(mechanicId: string): Promise<string> {
    const mechanic = await this.userModel.findById(mechanicId);
    if (!mechanic) throw new NotFoundException('Mechanic not found');

    const workOrders = await this.workOrderModel.find({
      mechanics: mechanic._id,
    });

    for (const order of workOrders) {
      // Archive mechanic before removal
      const alreadyArchived = order.mechanicHistory.some(
        (snap) => snap.email === mechanic.email,
      );

      if (!alreadyArchived) {
        order.mechanicHistory.push({
          name: mechanic.name,
          email: mechanic.email,
          phone: mechanic.mobile?.toString(),
          deletedAt: new Date(),
        });
      }

      // Remove mechanic from active list
      //@ts-ignore
      order.mechanics = order.mechanics.filter(
        //@ts-ignore
        (id) => !id.equals(mechanic._id),
      );
      await order.save();
    }

    // Optionally: delete mechanic account
    await this.userModel.findByIdAndDelete(mechanicId);

    return 'Mechanic deleted and archived successfully';
  }

  async deleteManagerFromWorkOrders(managerId: string): Promise<string> {
    const manager = await this.userModel.findById(managerId);
    if (!manager) throw new NotFoundException('Manager not found');

    const workOrders = await this.workOrderModel.find({
      shopManager: manager._id,
    });

    for (const order of workOrders) {
      // Archive manager before removal
      const alreadyArchived = order.managerHistory.some(
        (snap) => snap.email === manager.email,
      );

      if (!alreadyArchived) {
        order.managerHistory.push({
          name: manager.name,
          email: manager.email,
          phone: manager.mobile?.toString(),
          deletedAt: new Date(),
        });
      }

      // Remove manager from active list
      //@ts-ignore
      order.shopManager = order.shopManager.filter(
        //@ts-ignore
        (id) => !id.equals(manager._id),
      );
      await order.save();
    }

    // Optionally: delete manager account
    await this.userModel.findByIdAndDelete(managerId);

    return 'Shop manager deleted and archived successfully';
  }

  async getFilteredWorkOrdersByRole(
    userId: string,
    role: Role.Technician | Role.ShopManager,
    page = 1,
    limit = 20,
    filters: {
      status?: string;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
  ): Promise<{ data: WorkOrder[]; total: number }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException(`${role} not found`);

    const query: any = {};

    if (role === Role.Technician) query.mechanics = userId;
    if (role === Role.ShopManager) query.shopManager = userId;

    if (filters.status) query.status = filters.status;

    if (filters.startDate || filters.endDate) {
      query.startDate = {};
      if (filters.startDate) query.startDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.startDate.$lte = new Date(filters.endDate);
    }

    if (filters.search) {
      const regex = new RegExp(filters.search, 'i');
      query.$or = [
        { ownerName: regex },
        { headMechanic: regex },
        { orderCreatorName: regex },
        { ownerEmail: regex },
        { phoneNumber: regex },
        { address: regex },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.workOrderModel.find(query).skip(skip).limit(limit).populate('car'),
      this.workOrderModel.countDocuments(query),
    ]);

    return { data, total };
  }

  async getFilteredWorkOrdersByRoleWithinVehicle(
  carId: string,
  userId: string,
  role: Role.Technician | Role.ShopManager,
  page = 1,
  limit = 20,
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  },
): Promise<{ data: WorkOrder[]; total: number }> {
  const user = await this.userModel.findById(userId);
  if (!user) throw new NotFoundException(`${role} not found`);

  const query: any = {
    car: carId, // 🎯 Filter by specific vehicle
  };

  if (role === Role.Technician) query.mechanics = userId;
  if (role === Role.ShopManager) query.shopManager = userId;

  if (filters.status) query.status = filters.status;

  if (filters.startDate || filters.endDate) {
    query.startDate = {};
    if (filters.startDate) query.startDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.startDate.$lte = new Date(filters.endDate);
  }

  if (filters.search) {
    const regex = new RegExp(filters.search, 'i');
    query.$or = [
      { ownerName: regex },
      { headMechanic: regex },
      { orderCreatorName: regex },
      { ownerEmail: regex },
      { phoneNumber: regex },
      { address: regex },
    ];
  }

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.workOrderModel.find(query).skip(skip).limit(limit).populate('car'),
    this.workOrderModel.countDocuments(query),
  ]);

  return { data, total };
}


  async updateWorkOrder(
    id: string,
    updateDto: UpdateWorkOrderDto,
  ): Promise<WorkOrder> {
    const updated = await this.workOrderModel.findByIdAndUpdate(id, updateDto, {
      new: true,
    });

    if (!updated) {
      throw new NotFoundException('Work Order not found');
    }

    return updated;
  }


  async searchWorkOrdersByCar(
  carId: string,
  userId: string,
  page = 1,
  limit = 20,
  search?: string,
): Promise<{
  data: WorkOrderDocument[];
  total: number;
}> {
  if (!mongoose.Types.ObjectId.isValid(carId)) {
    throw new BadRequestException('Invalid car ID');
  }

  const user = await this.userModel.findById(userId);
  if (!user) throw new NotFoundException('User not found');

  const skip = (page - 1) * limit;

  // ✅ Base filters
  const andFilters: any[] = [{ car: carId }];

  // 🔍 Elastic-style search
  if (search) {
    const regex = new RegExp(search, 'i');
    andFilters.push({
      $or: [
        { title: regex },
        { description: regex },
        { status: regex },
      ],
    });
  }

  // 🔒 Access control
  if (user.role !== Role.SystemAdministrator) {
    andFilters.push({
      $or: [
        { shopManagers: user._id },
        { mechanics: user._id },
      ],
    });
  }

  const finalQuery = { $and: andFilters };

  // ⏳ Run both query and count in parallel
  const [data, total] = await Promise.all([
    this.workOrderModel.find(finalQuery).skip(skip).limit(limit),
    this.workOrderModel.countDocuments(finalQuery),
  ]);

  return { data, total };
}



 



  
}
