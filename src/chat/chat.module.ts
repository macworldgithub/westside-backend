import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOrder, WorkOrderSchema } from 'src/schemas/Work-Order.Schema';
import { User, UserSchema } from 'src/schemas/User.Schemas';
import { ChatRoom, ChatRoomSchema } from 'src/schemas/ChatRoom.Schema';

@Module({
  providers: [ChatService],
  controllers: [ChatController],
  imports: [
    MongooseModule.forFeature([
      { name: WorkOrder.name, schema: WorkOrderSchema },
      { name: User.name, schema: UserSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
})
export class ChatModule {}
