import { Module } from '@nestjs/common';
import { WorkorderService } from './workorder.service';
import { WorkorderController } from './workorder.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkOrder, WorkOrderSchema } from 'src/schemas/Work-Order.Schema';
import { User, UserSchema } from 'src/schemas/User.Schemas';
import { ChatRoom, ChatRoomSchema } from 'src/schemas/ChatRoom.Schema';

@Module({
  providers: [WorkorderService],
  controllers: [WorkorderController],
  imports: [
    MongooseModule.forFeature([
      { name: WorkOrder.name, schema: WorkOrderSchema },
      { name: User.name, schema: UserSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
  ],
})
export class WorkorderModule {}
