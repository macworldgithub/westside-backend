import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { AwsService } from 'src/aws/aws.service';
import { Repair, RepairDocument } from 'src/schemas/Repair.Schema';
import { CreateRepairDto } from './dto/req/create-repair.dto';
import { RepairResponseDto } from './dto/res/create-response.dto';
import { UpdateRepairDto } from './dto/req/update-repair.dto';
import { User, UserDocument } from 'src/schemas/User.Schemas';
import { Role } from 'src/auth/roles.enum';
import { WorkOrder, WorkOrderDocument } from 'src/schemas/Work-Order.Schema';

@Injectable()
export class RepairService {
  constructor(
    @InjectModel(Repair.name) private repairModel: Model<RepairDocument>,
    private readonly awsService: AwsService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(WorkOrder.name)
    private workOrderModel: Model<WorkOrderDocument>,
  ) {}

  async getAllRepairs(
    workOrderId: string,
    page = 1,
    limit = 20,
    filters?: {
      mechanicName?: string;
      partName?: string;
      submitted?: boolean;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ data: RepairResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const query: any = {
      workOrder: workOrderId,
    };

    if (filters?.mechanicName) {
      query.mechanicName = { $regex: filters.mechanicName, $options: 'i' };
    }

    if (filters?.partName) {
      query.partName = { $regex: filters.partName, $options: 'i' };
    }

    if (typeof filters?.submitted === 'boolean') {
      query.submitted = filters.submitted;
    }

    if (filters?.startDate || filters?.endDate) {
      query.finishDate = {};
      if (filters.startDate) {
        query.finishDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.finishDate.$lte = new Date(filters.endDate);
      }
    }

    const [repairs, total] = await Promise.all([
      this.repairModel.find(query).skip(skip).limit(limit),
      this.repairModel.countDocuments(query),
    ]);

    const data = await Promise.all(
      repairs.map(async (repair) => ({
        _id: repair._id.toString(),
        workOrder: repair.workOrder.toString(),
        mechanicName: repair.mechanicName,
        partName: repair.partName,
        price: repair.price,
        finishDate: repair.finishDate,
        notes: repair.notes,
        submitted: repair.submitted,
        beforeImageUrl: repair.beforeImageUri
          ? await this.awsService.getSignedUrl(repair.beforeImageUri)
          : undefined,
        afterImageUrl: repair.afterImageUri
          ? await this.awsService.getSignedUrl(repair.afterImageUri)
          : undefined,
      })),
    );

    return { data, total };
  }

  async createRepair(
    dto: CreateRepairDto,
    beforeImage?: Express.Multer.File,
    afterImage?: Express.Multer.File,
  ): Promise<Repair> {
    let beforeImageKey: string | undefined;
    let afterImageKey: string | undefined;

    if (beforeImage) {
      beforeImageKey = await this.awsService.uploadFile(
        beforeImage.buffer,
        beforeImage.originalname,
        'repairs',
        beforeImage.mimetype,
      );
    }

    if (afterImage) {
      afterImageKey = await this.awsService.uploadFile(
        afterImage.buffer,
        afterImage.originalname,
        'repairs',
        afterImage.mimetype,
      );
    }

    const repair = new this.repairModel({
      ...dto,
      workOrder: new Types.ObjectId(dto.workOrder), // 👈 convert here
      finishDate: new Date(dto.finishDate),
      beforeImageUri: beforeImageKey,
      afterImageUri: afterImageKey,
      submitted: false,
    });

    return repair.save();
  }

  async updateRepair(
    repairId: string,
    dto: UpdateRepairDto,
    userId: string,
  ): Promise<RepairResponseDto> {
    const [repair, user] = await Promise.all([
      this.repairModel.findById(repairId),
      this.userModel.findById(userId),
    ]);

    if (!repair) throw new NotFoundException('Repair not found');
    if (!user) throw new NotFoundException('User not found');

    // 🚫 Restrict: Technician cannot update submitted repairs
    if (repair.submitted && user.role === Role.Technician) {
      throw new BadRequestException(
        'Technicians cannot update submitted repairs',
      );
    }

    // ✅ Apply updates
    if (dto.mechanicName !== undefined) repair.mechanicName = dto.mechanicName;
    if (dto.partName !== undefined) repair.partName = dto.partName;
    if (dto.price !== undefined) repair.price = dto.price;
    if (dto.finishDate) {
      const parsedDate = new Date(dto.finishDate);
      if (!isNaN(parsedDate.getTime())) {
        repair.finishDate = parsedDate;
      } else {
        throw new BadRequestException('Invalid finishDate format');
      }
    }
    if (dto.notes !== undefined) repair.notes = dto.notes;
    if (dto.submitted !== undefined) repair.submitted = dto.submitted;

    if (dto.beforeImageUri) {
      const key = await this.awsService.extractKeyFromSignedUrl(
        dto.beforeImageUri,
      );
      if (key) repair.beforeImageUri = key;
    }

    if (dto.afterImageUri) {
      const key = await this.awsService.extractKeyFromSignedUrl(
        dto.afterImageUri,
      );
      if (key) repair.afterImageUri = key;
    }

    await repair.save();

    return {
      _id: repair._id.toString(),
      workOrder: repair.workOrder.toString(),
      mechanicName: repair.mechanicName,
      partName: repair.partName,
      price: repair.price,
      finishDate: repair.finishDate,
      notes: repair.notes,
      submitted: repair.submitted,
      beforeImageUrl: repair.beforeImageUri
        ? await this.awsService.getSignedUrl(repair.beforeImageUri)
        : undefined,
      afterImageUrl: repair.afterImageUri
        ? await this.awsService.getSignedUrl(repair.afterImageUri)
        : undefined,
    };
  }

  async getSingleRepairById(id: string): Promise<any> {
    const repair = await this.repairModel.findById(id);
    if (!repair) throw new NotFoundException('Repair not found');

    return {
      _id: repair._id.toString(),
      workOrder: repair.workOrder.toString(),
      mechanicName: repair.mechanicName,
      partName: repair.partName,
      price: repair.price,
      finishDate: repair.finishDate?.toISOString(),
      notes: repair.notes,
      submitted: repair.submitted,
      beforeImageUrl: repair.beforeImageUri
        ? await this.awsService.getSignedUrl(repair.beforeImageUri)
        : undefined,
      afterImageUrl: repair.afterImageUri
        ? await this.awsService.getSignedUrl(repair.afterImageUri)
        : undefined,
    };
  }

  async uploadRepairImage(
    repairId: string,
    userId: string,
    file: Express.Multer.File,
    type: 'before' | 'after',
  ): Promise<string> {
    const repair = await this.repairModel.findById(repairId);
    if (!repair) throw new NotFoundException('Repair not found');

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (repair.submitted && user.role === Role.Technician) {
      throw new ForbiddenException('Cannot upload image after submission');
    }

    const key = await this.awsService.uploadFile(
      file.buffer,
      file.originalname,
      'repairs',
      file.mimetype,
    );

    if (type === 'before') {
      repair.beforeImageUri = key;
    } else {
      repair.afterImageUri = key;
    }

    await repair.save();
    return await this.awsService.getSignedUrl(key);
  }

  async deleteRepairImage(
    repairId: string,
    userId: string,
    type: 'before' | 'after',
  ): Promise<string> {
    const repair = await this.repairModel.findById(repairId);
    if (!repair) throw new NotFoundException('Repair not found');

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (repair.submitted && user.role === Role.Technician) {
      throw new ForbiddenException('Cannot delete image after submission');
    }

    const key =
      type === 'before' ? repair.beforeImageUri : repair.afterImageUri;

    if (!key) throw new BadRequestException('No image found to delete');

    await this.awsService.deleteFile(key);

    if (type === 'before') {
      repair.beforeImageUri = undefined;
    } else {
      repair.afterImageUri = undefined;
    }

    await repair.save();

    return `${type} image deleted successfully.`;
  }

  async getRepairsByIdWithPermission(
    workOrderId: string,
    userId: string,
  ): Promise<{
    workOrder: WorkOrderDocument;
    repairs: RepairDocument[];
  }> {
    if (!mongoose.Types.ObjectId.isValid(workOrderId)) {
      throw new BadRequestException('Invalid work order ID');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const workOrder = await this.workOrderModel.findById(workOrderId);
    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (user.role !== Role.SystemAdministrator) {
      const isAuthorized =
        //@ts-ignore
        workOrder.shopManagers?.some((id) => id.toString() === userId) ||
        workOrder.mechanics?.some((id) => id.toString() === userId);

      if (!isAuthorized) {
        throw new ForbiddenException(
          'You are not authorized to view this work order',
        );
      }
    }

    let repairs = await this.repairModel.find({
      workOrder: workOrder._id,
    });

   const signedRepairs = await Promise.all(
    repairs.map(async (repair) => {
      const signed = repair.toObject();
      //@ts-ignore
      signed.beforeImageUri = repair.beforeImageUri
        ? await this.awsService.getSignedUrl(repair.beforeImageUri)
        : '';
        //@ts-ignore
      signed.afterImageUri = repair.afterImageUri
        ? await this.awsService.getSignedUrl(repair.afterImageUri)
        : '';
      return signed;
    }),
  );

   

    return {
      workOrder,
      repairs: signedRepairs,
    };
  }
}
