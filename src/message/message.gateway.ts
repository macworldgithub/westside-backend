import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({ cors: true })
export class MessageGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  // When a client sends a message
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    payload: CreateMessageDto & {
      images?: { base64: string; name: string; mimeType: string }[];
      videos?: { base64: string; name: string; mimeType: string }[];
      files?: { base64: string; name: string; mimeType: string }[];
      audio?: { base64: string; name: string; mimeType: string };
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.messageService.createMessageViaSocket(payload);

      // Emit message to all clients in this chat room
      this.server.to(payload.chatRoomId).emit('new_message', message);
    } catch (err) {
      console.error('❌ Error sending message:', err.message);
      client.emit('error', { message: 'Failed to send message.' });
    }
  }

  // Join room when user opens a chat
  @SubscribeMessage('join_chat')
  handleJoinRoom(
    @MessageBody() chatRoomId: string,
    @ConnectedSocket() client: Socket,
  ) {
  
    client.join(chatRoomId);
  }

  // Leave room
  @SubscribeMessage('leave_chat')
  handleLeaveRoom(
    @MessageBody() chatRoomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(chatRoomId);
  }
}
