import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoomDocument } from 'src/schemas/ChatRoom.Schema';
import { WorkOrder, WorkOrderDocument } from 'src/schemas/Work-Order.Schema';
import { ChatRoom } from 'src/schemas/ChatRoom.Schema';
import { User, UserDocument } from 'src/schemas/User.Schemas';
import { Role } from 'src/auth/roles.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(WorkOrder.name)
    private workOrderModel: Model<WorkOrderDocument>,

    @InjectModel(ChatRoom.name)
    private chatRoomModel: Model<ChatRoomDocument>,

    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createWorkOrderChat(
    workOrderId: string,
    initiatorId: string,
  ): Promise<ChatRoomDocument> {
    const existingChat = await this.chatRoomModel.findOne({
      workOrderId: new Types.ObjectId(workOrderId),
    });

    if (existingChat) {
      throw new ConflictException('Chat already exists for this work order');
    }

    const workOrder = await this.workOrderModel
      .findById(workOrderId)
      .select('_id mechanics shopManager createdBy')
      .lean();

    if (!workOrder) throw new NotFoundException('Work order not found');

    const participantSet = new Set<string>();

    workOrder.mechanics?.forEach((id) => participantSet.add(id.toString()));
    workOrder.shopManager?.forEach((id) => participantSet.add(id.toString()));
    //@ts-ignore
    workOrder.createdBy?.forEach((id) => participantSet.add(id.toString()));

    const allSystemAdministrator = await this.userModel.find({
      role: Role.SystemAdministrator,
    });

    if (allSystemAdministrator.length > 0) {
      allSystemAdministrator.forEach((item) => {
        participantSet.add(item._id.toString()); // 💡 Optional: convert to string for consistency
      });
    }
    // Ensure initiator is in the participants too
    participantSet.add(initiatorId);

    const participants = Array.from(participantSet).map(
      (id) => new Types.ObjectId(id),
    );

    const chat = new this.chatRoomModel({
      workOrderId: workOrder._id,
      name: `Work Order- ${workOrder._id}`,
      participants,
      createdBy: new Types.ObjectId(initiatorId),
    });

    return await chat.save();
  }
}
