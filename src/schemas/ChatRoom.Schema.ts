import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'WorkOrder',
    required: true,
  })
  workOrderId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  participants: Types.ObjectId[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export type ChatRoomDocument = ChatRoom & Document;
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
