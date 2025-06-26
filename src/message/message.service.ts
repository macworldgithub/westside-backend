import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom, ChatRoomDocument } from 'src/schemas/ChatRoom.Schema';
import { Message, MessageDocument } from 'src/schemas/Message.Schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { AwsService } from 'src/aws/aws.service';

interface MessageWithSignedUrls {
  _id: Types.ObjectId;
  chatRoomId: Types.ObjectId;
  sender: Types.ObjectId;
  text?: string;
  imageUrls: string[];
  videoUrls: string[];
  fileUrls: string[];
  audioUrl?: string;
  fileNames?: string[];
  isDeleted?: boolean;
  isEdited?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoomDocument>,
    private readonly awsService: AwsService,
  ) {}

  async createMessageViaSocket(
    payload: CreateMessageDto & {
      images?: { base64: string; name: string; mimeType: string }[];
      videos?: { base64: string; name: string; mimeType: string }[];
      files?: { base64: string; name: string; mimeType: string }[];
      audio?: { base64: string; name: string; mimeType: string };
    },
  ): Promise<MessageWithSignedUrls> {
    const { chatRoomId, sender, text } = payload;

    console.log(payload);

    const objectId = new Types.ObjectId(chatRoomId);

    const chatRoom = await this.chatRoomModel.findById(objectId);

    console.log(chatRoom, '');
    if (!chatRoom) throw new NotFoundException('ChatRoom not found');

    const isParticipant = chatRoom.participants.some(
      (id) => id.toString() === sender,
    );
    if (!isParticipant) {
      throw new ForbiddenException('You are not a member of this chat.');
    }

    // 🧠 Upload base64 files to S3
    const uploadFromBase64 = async (
      files: { base64: string; name: string; mimeType: string }[] | undefined,
      folder: string,
    ) => {
      if (!files) return [];

      return Promise.all(
        files.map((file) => {
          const base64Data = file.base64.split(',')[1]; // Remove data:mime/type;base64,
          const buffer = Buffer.from(base64Data, 'base64');
          return this.awsService.uploadFile(
            buffer,
            file.name,
            folder,
            file.mimeType,
          );
        }),
      );
    };

    const imageKeys = await uploadFromBase64(payload.images, 'chat/images');
    const videoKeys = await uploadFromBase64(payload.videos, 'chat/videos');
    const fileKeys = await uploadFromBase64(payload.files, 'chat/files');

    let audioKey: string | undefined;
    if (payload.audio) {
      const base64Data = payload.audio.base64.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      audioKey = await this.awsService.uploadFile(
        buffer,
        payload.audio.name,
        'chat/audio',
        payload.audio.mimeType,
      );
    }

    // 🔐 Convert stored keys to signed URLs for client
    const signedImages = await Promise.all(
      imageKeys.map((key) => this.awsService.getSignedUrl(key)),
    );

    const signedVideos = await Promise.all(
      videoKeys.map((key) => this.awsService.getSignedUrl(key)),
    );

    const signedFiles = await Promise.all(
      fileKeys.map((key) => this.awsService.getSignedUrl(key)),
    );

    const signedAudio = audioKey
      ? await this.awsService.getSignedUrl(audioKey)
      : undefined;

    // 🧾 Save message to DB
    const newMessage = await new this.messageModel({
      chatRoomId,
      sender,
      text,
      imageUrls: imageKeys,
      videoUrls: videoKeys,
      fileUrls: fileKeys,
      audioUrl: audioKey,
    }).save();

    // ✅ Return message with signed URLs for the frontend
    //@ts-ignore
    return {
      ...newMessage.toObject(),
      imageUrls: signedImages,
      videoUrls: signedVideos,
      fileUrls: signedFiles,
      audioUrl: signedAudio,
    };
  }

  async getMessagesByChat(chatRoomId: string): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ chatRoomId: new Types.ObjectId(chatRoomId) })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email');
  }
}
