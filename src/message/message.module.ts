import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from 'src/schemas/ChatRoom.Schema';
import { Message, MessageSchema } from 'src/schemas/Message.Schema';
import { AwsModule } from 'src/aws/aws.module';
import { AwsService } from 'src/aws/aws.service';
import { MessageGateway } from './message.gateway';

@Module({
  providers: [MessageService ,AwsService ,MessageGateway],
  exports:[MessageService],
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
    AwsModule,
  ],
})
export class MessageModule {}
