import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom, ChatRoomDocument } from 'src/schemas/ChatRoom.Schema';
import { Message, MessageDocument } from 'src/schemas/Message.Schema';
import { CreateMessageDto } from './dto/create-message.dto';


@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoomDocument>,
  ) {}

  async createMessage(dto: CreateMessageDto): Promise<MessageDocument> {
    const { chatRoomId, sender } = dto;

    // ✅ Check ChatRoom exists
    const chatRoom = await this.chatRoomModel.findById(chatRoomId);
    if (!chatRoom) throw new NotFoundException('Chat room not found');

    // ✅ Check sender is part of the chat room
    const isParticipant = chatRoom.participants.some(
      (id) => id.toString() === sender,
    );

    if (!isParticipant) {
      throw new BadRequestException('Sender is not part of this chat room');
    }

    // 💬 Create Message
    const newMessage = new this.messageModel({
      ...dto,
      chatRoomId: new Types.ObjectId(dto.chatRoomId),
      sender: new Types.ObjectId(dto.sender),
    });

    return await newMessage.save();
  }

  async getMessagesByChat(chatRoomId: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ chatRoomId: new Types.ObjectId(chatRoomId) })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email');
  }
}
