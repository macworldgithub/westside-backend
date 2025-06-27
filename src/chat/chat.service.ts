import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { ChatRoomDocument } from 'src/schemas/ChatRoom.Schema';
import { WorkOrder, WorkOrderDocument } from 'src/schemas/Work-Order.Schema';
import { ChatRoom } from 'src/schemas/ChatRoom.Schema';
import { User, UserDocument } from 'src/schemas/User.Schemas';
import { Role } from 'src/auth/roles.enum';
import { Message, MessageDocument } from 'src/schemas/Message.Schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(WorkOrder.name)
    private workOrderModel: Model<WorkOrderDocument>,

    @InjectModel(ChatRoom.name)
    private chatRoomModel: Model<ChatRoomDocument>,

    @InjectModel(User.name) private userModel: Model<UserDocument>,

    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
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

  async getUserChatRooms(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isAdmin = user.role === Role.SystemAdministrator;

    const chatRooms = await this.chatRoomModel.aggregate([
      {
        $match: isAdmin
          ? {}
          : {
              participants: new Types.ObjectId(userId),
            },
      },
      {
        $lookup: {
          from: 'messages',
          let: { chatRoomId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$chatRoomId', '$$chatRoomId'] },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'sender',
              },
            },
            {
              $unwind: {
                path: '$sender',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          as: 'lastMessage',
        },
      },
      {
        $unwind: {
          path: '$lastMessage',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          'lastMessage.createdAt': -1,
        },
      },
    ]);

    return chatRooms;
  }

  async getMessagesByChatRoom(
    chatRoomId: string,
    weekOffset = 0,
  ): Promise<{
    messages: MessageDocument[];
    totalWeeks: number;
    currentWeek: number;
  }> {
    const roomExists = await this.chatRoomModel.exists({ _id: chatRoomId });
    if (!roomExists) throw new NotFoundException('Chat room not found');

    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setUTCDate(now.getUTCDate() - now.getUTCDay()); // Sunday as start
    startOfThisWeek.setUTCHours(0, 0, 0, 0);

    const endOfTargetWeek = new Date(startOfThisWeek);
    endOfTargetWeek.setUTCDate(
      endOfTargetWeek.getUTCDate() - 7 * weekOffset + 6,
    );
    endOfTargetWeek.setUTCHours(23, 59, 59, 999);

    const startOfTargetWeek = new Date(endOfTargetWeek);
    startOfTargetWeek.setUTCDate(endOfTargetWeek.getUTCDate() - 6);
    startOfTargetWeek.setUTCHours(0, 0, 0, 0);

    // 🧠 Count total weeks of message history
    const oldestMessage = await this.messageModel
      .findOne({ chatRoomId: new Types.ObjectId(chatRoomId) })
      .sort({ createdAt: 1 })
      .select('createdAt')
      .lean();

    let totalWeeks = 0;
    //@ts-ignore
    if (oldestMessage?.createdAt) {
      //@ts-ignore
      const diff = now.getTime() - new Date(oldestMessage.createdAt).getTime();
      totalWeeks = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
    }

    const messages = await this.messageModel
      .find({
        chatRoomId: new Types.ObjectId(chatRoomId),
        createdAt: {
          $gte: startOfTargetWeek,
          $lte: endOfTargetWeek,
        },
      })
      .populate('sender', 'name email') // optional: populate sender info
      .sort({ createdAt: 1 }) // oldest to latest
      .lean();

    return {
      messages,
      totalWeeks,
      currentWeek: weekOffset,
    };
  }
}
