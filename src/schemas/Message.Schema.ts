import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', required: true })
  chatRoomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: String })
  text?: string;

  @Prop({ type: [String], default: [] })
  imageUrls?: string[];

  @Prop({ type: [String], default: [] })
  videoUrls?: string[];

  @Prop({ type: [String], default: [] })
  fileUrls?: string[];

  @Prop({ type: [String], default: [] })
  fileNames?: string[]; // Optional original names for each file

  @Prop({ type: String })
  audioUrl?: string; // One audio message per message (if needed)

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop({ default: false })
  isEdited?: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
