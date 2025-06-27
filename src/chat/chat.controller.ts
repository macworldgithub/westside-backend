// chat.controller.ts

import {
  Controller,
  Post,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ChatService } from './chat.service';

import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ChatRoom,
  ChatRoomDocument,
  ChatRoomSchema,
} from 'src/schemas/ChatRoom.Schema';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create-workorder-chat/:workOrderId')
  @ApiOperation({ summary: 'Create group chat for a work order' })
  @ApiParam({
    name: 'workOrderId',
    description: 'ID of the work order',
    example: '665b27f014c4b63a1fbe0033',
  })
  @ApiQuery({
    name: 'initiatorId',
    description: 'User ID who is initiating the chat (must be a User)',
    example: '665a99c08a01d6334c46c1a2',
  })
  @ApiResponse({
    status: 201,
    description: 'Chat room created successfully',
    type: ChatRoom,
  })
  @ApiResponse({
    status: 404,
    description: 'Work order not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Chat already exists for this work order',
  })
  @HttpCode(HttpStatus.CREATED)
  async createWorkOrderChat(
    @Param('workOrderId') workOrderId: string,
    @Query('initiatorId') initiatorId: string,
  ): Promise<ChatRoomDocument> {
    return this.chatService.createWorkOrderChat(workOrderId, initiatorId);
  }

  @Get('chat-rooms/:userId')
  getUserChatRooms(@Param('userId') userId: string) {
    return this.chatService.getUserChatRooms(userId);
  }

  @Get(':chatRoomId/messages')
  async getMessagesByWeek(
    @Param('chatRoomId') chatRoomId: string,
    @Query('week') week = '0', // 0 = current week
  ) {
    return this.chatService.getMessagesByChatRoom(chatRoomId, parseInt(week));
  }
}
